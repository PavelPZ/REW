module waObjs {

  //************* interfaces *****************
  export enum itemType {
    text,
    block,
    rootBlock,
  }

  export interface IItem {
    type: itemType;
  } var IItemProps = ['type'];

  export interface IText extends IItem {
    text: string;
  } export var ITextProps = ['text'].pushArray(IItemProps);

  export interface IBlock extends IItem {
    name: string;
    pars: string;
    childs: Array<IItem>;
  } export var IBlockProps = ['name', 'pars'].pushArray(IItemProps);

  //************* ITEM *****************
  export class item implements IItem {

    type: itemType;
    $self: JQuery; //html node, reprezentujici self
    root: rootBlock; //my root node

    selfProps = IItemProps; //property names pro JSON serializaci. Serializuji se pouze tyto props, ostatni se ignoruji. Virtualni dato, pouzito v getJSONObject();

    constructor(json?: IItem, $parent?: JQuery, public parent?: block) {
      if (!json) return;
      this.root = parent ? parent.root : <rootBlock>this;
      if (json) for (var p in json) this[p] = json[p];
      this.$self = $(this.toHTMLString());
      this.$self.data('wa', this);
      $parent.append(this.$self);
    }
    toHTMLString(): string { return ''; } //vrati HTML fragment pro $self
    refreshPropsFromHtml() { } //z HTML prevezme data pro JSON serializaci

    getJSONObject(modify: () => void = null): IItem {
      if (modify) modify();
      var res = {};
      _.each(this.selfProps, p => res[p] = this[p]);
      var chs: Array<item> = this['childs'];
      if (chs) res['childs'] = _.map(chs, ch => ch.getJSONObject());
      return <IItem>res;
    }

    //******* COMPILE ******
    //encodeBlockForCompile(ctx: waCompile.context, sb: Array<string>) { throw 'abstract';}
  }
  
  
  //************* test *****************
  export function test() {
    $(() => {
      var item = block.itemFromJSON(testJson, $('#edit-content'), null);
      //new metaJS.propEditor($('#prop-editor > .sm-text'), 'gap-fill', 'id=gp1; smart-width=sw1');
      //testJson = item.getJSONObject();
      //Utils.longLog(JSON.stringify(testJson, null, 2));
      //$('#edit-content').html('');
      //block.itemFromJSON(testJson, $('#edit-content'), null);
    });
  }

  var testJson: IItem = {
    type: itemType.rootBlock, name: '', pars: '',
    childs: [
      //{ type: itemType.text, text: '{+gap-fill(id=gp; smart-width=sw1;)}' },
      { type: itemType.text, text: '{+offering(drop-down-mode=discard)}' },
      //{ type: itemType.text, text: 'text {+gap-fill() }' },
    ]
  };

  //var testJson: IItem = {
  //  type: itemType.rootBlock, name: '', pars: '',
  //  childs: [
  //    { type: itemType.text, text: 'xxx ' },
  //    {
  //      type: itemType.block, name: 'block', pars: 'pars',
  //      childs: [
  //        { type: itemType.text, text: 'zzz ' },
  //      ]
  //    },
  //    { type: itemType.text, text: 'yyy' },
  //  ]
  //};

  //var testJson: IItem = {
  //  type: itemType.rootBlock, name: 'block', pars: '',
  //  childs: [
  //    { type: itemType.text, text: '{#block #} {* {* *} *} {! } {+gap-fill asdf sd fa sdf asd fasd f asdf asd fasd f asdf ad f asdfads fadsf } {+gap-fill {! {#table {# {* }' },
  //  ]
  //};

  //var testJson: IItem = { type: itemType.text, text: '#}xxx' };
} 