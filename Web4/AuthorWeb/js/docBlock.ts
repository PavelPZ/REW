module waObjs {

  //************* BLOCK *****************
  export class block extends item implements IBlock {

    name: string; //jmeno bloku, napr. TABLE
    pars: string; //parametry bloku
    childs: Array<item>;
    selfProps = IBlockProps; //pro JSON serializaci

    constructor(json?: IBlock, $parent?: JQuery, parent?: block) {
      super(json, $parent, parent);
      if (!json) return;
      this.appendChilds(this.myChildPlaceHolder());
    }

    appendChilds(placeHolder: JQuery) {
      var chs = this.childs; if (!chs) return;
      for (var i = 0; i < chs.length; i++) chs[i] = block.itemFromJSON(<item>(chs[i]), placeHolder, this);
    }

    static itemFromJSON(json: IItem, $parent: JQuery, parent: block): item {
      switch (json.type) {
        case itemType.text: return new text(<IText>json, $parent, parent); break;
        case itemType.block: return new block(<IBlock>json, $parent, parent); break;
        case itemType.rootBlock: return new rootBlock(<IBlock>json, $parent, parent); break;
        default: throw "";
      }
    }

    toHTMLString(): string {
      return '<div class="sm-block"><div class="sm-block-header">' +
        '<span class="sm-block-name sm-edit-block-lnk">{#' + this.name.toUpperCase() + (this.pars ? '</span><span class="sm-block-par"> ' + this.pars + '</span>' : '') + //header
        '</div><div class="sm-block-body"></div><div class="sm-block-footer">' + //footer
        '<span class="sm-block-name">#}</span>' +
        '</div></div>';
    }
    myChildPlaceHolder(): JQuery { return this.$self.find('> .sm-block-body'); }

    refreshPropsFromHtml() { _.each(this.childs, ch => ch.refreshPropsFromHtml()); }

    buildEditContent(modifyProc: () => void) {
      this.root.refreshPropsFromHtml(); //prevezmi data z HTML dom
      var newRoot = this.root.getJSONObject(modifyProc);
      this.root.$content.html('');
      block.itemFromJSON(newRoot, this.root.$content, null);
    }

    /************ EDIT BLOCK TREE *************/

    insert(self: text, rng: textRange.IRange, edVal: string, blockName: string) {
      if (self.marks.findMark(rng.start).idx != self.marks.findMark(rng.end).idx) rng.start = rng.end;
      //data pro nove bloky
      var blText = new text(); blText.type = itemType.text; blText.text = edVal.substring(rng.start, rng.end);
      var bl = new block(); bl.name = blockName; bl.type = itemType.block; bl.childs = [blText];
      var txt = new text(); txt.type = itemType.text; txt.text = edVal.substr(rng.end);
      //strip puvodni blok
      self.setText(edVal.substr(0, rng.start)); 
      //uprav nahrad self 
      this.buildEditContent(() => {
        var selfIdx = this.childs.indexOf(self);
        this.childs.splice(selfIdx + 1, 0, bl, txt);
      });
    }
    delContent() {
      this.buildEditContent(() => this.childs = []);
    }
    delBracket() {
      this.buildEditContent(() => {
        var parChilds = this.parent.childs; var childs = this.childs;
        var selfIdx = parChilds.indexOf(this);
        if (selfIdx == 0 || selfIdx == parChilds.length - 1 || parChilds[selfIdx - 1].type != itemType.text || parChilds[selfIdx + 1].type != itemType.text) throw 'block not between two texts';
        if (childs.length > 0 && (childs[0].type != itemType.text || childs[childs.length - 1].type != itemType.text)) throw 'block not starts and ends with text';
        var parRes: Array<item> = [];
        for (var i = 0; i < selfIdx; i++) parRes.push(parChilds[i]);
        for (var i = 0; i < childs.length; i++) {
          if (i == 0) {
            var it = <text>(childs[i]); var last = <text>(parRes[parRes.length - 1]);
            last.text += it.text;
          } else
            parRes.push(childs[i]);
        }
        for (var i = selfIdx + 1; i < parChilds.length; i++) {
          if (i == selfIdx + 1) {
            var it = <text>(parChilds[i]); var last = <text>(parRes[parRes.length - 1]);
            last.text += it.text;
          } else
            parRes.push(childs[i]);
        }
        this.parent.childs = parRes;
      });
    }
    delAll() {
      this.buildEditContent(() => {
        var parChilds = this.parent.childs; var selfIdx = parChilds.indexOf(this);
        if (selfIdx == 0 || selfIdx == parChilds.length - 1 || parChilds[selfIdx - 1].type != itemType.text || parChilds[selfIdx + 1].type != itemType.text) throw 'block not between two texts';
        var before = <text>(parChilds[selfIdx - 1]); var after = <text>(parChilds[selfIdx + 1]);
        before.text += after.text;
        parChilds.splice(selfIdx, 2);
      });
    }

    //******* COMPILE ******
    compileResult: Array<CourseModel.tag>;

    //encodeBlockForCompile(ctx: waCompile.context, sb: Array<string>) {
    //  ctx.encodeMarkForCompile(new blockPtrMark(null, this), sb);
    //  //var blockPtr = new blockPtrMark(null, this);
    //  //blockPtr.encodeMarksForCompile(ctx, sb);
    //}
  } 

  //************* ROOT BLOCK *****************
  export class rootBlock extends block implements IBlock {

    $content: JQuery;

    constructor(json?: IBlock, $parent?: JQuery, public parent?: block) {
      super(json, $parent, parent);
      if (!json) return;
      this.$content = $parent;
      this.$content.on('click', '.sm-edit-block-lnk', ev => {
        var target = <HTMLElement>(ev.target);
        var $block = $(target.parentElement.parentElement);
        var bl: block = <block>($block.data('wa'));
        new DlgEditBlock($(target), res => {
          switch (res) {
            case 'content': bl.delContent(); break;
            case 'bracket': bl.delBracket(); break;
            case 'both': bl.delAll(); break;
            default: throw 'not implemented';
          }
          return null;
        });
      });

    }
    toHTMLString(): string {
      return '<div class="sm-block-body"></div>';
    }
    myChildPlaceHolder(): JQuery { return this.$self; }

    notifyDataChanged() {
      var self = this;
      if (self.refreshTimer) return;
      self.refreshTimer = setTimeout(() => {
        clearTimeout(self.refreshTimer); self.refreshTimer = 0;
        waCompile.compile(this);
        var res = JSON.stringify(this.compileResult, null, 2);
        $('#preview-content').text(res);
      }, 1);
    }
    refreshTimer: number;
  }


} 