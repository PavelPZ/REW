var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var waObjs;
(function (waObjs) {
    //************* BLOCK *****************
    var block = (function (_super) {
        __extends(block, _super);
        function block(json, $parent, parent) {
            _super.call(this, json, $parent, parent);
            this.selfProps = waObjs.IBlockProps; //pro JSON serializaci
            if (!json)
                return;
            this.appendChilds(this.myChildPlaceHolder());
        }
        block.prototype.appendChilds = function (placeHolder) {
            var chs = this.childs;
            if (!chs)
                return;
            for (var i = 0; i < chs.length; i++)
                chs[i] = block.itemFromJSON((chs[i]), placeHolder, this);
        };
        block.itemFromJSON = function (json, $parent, parent) {
            switch (json.type) {
                case waObjs.itemType.text:
                    return new waObjs.text(json, $parent, parent);
                    break;
                case waObjs.itemType.block:
                    return new block(json, $parent, parent);
                    break;
                case waObjs.itemType.rootBlock:
                    return new rootBlock(json, $parent, parent);
                    break;
                default: throw "";
            }
        };
        block.prototype.toHTMLString = function () {
            return '<div class="sm-block"><div class="sm-block-header">' +
                '<span class="sm-block-name sm-edit-block-lnk">{#' + this.name.toUpperCase() + (this.pars ? '</span><span class="sm-block-par"> ' + this.pars + '</span>' : '') +
                '</div><div class="sm-block-body"></div><div class="sm-block-footer">' +
                '<span class="sm-block-name">#}</span>' +
                '</div></div>';
        };
        block.prototype.myChildPlaceHolder = function () { return this.$self.find('> .sm-block-body'); };
        block.prototype.refreshPropsFromHtml = function () { _.each(this.childs, function (ch) { return ch.refreshPropsFromHtml(); }); };
        block.prototype.buildEditContent = function (modifyProc) {
            this.root.refreshPropsFromHtml(); //prevezmi data z HTML dom
            var newRoot = this.root.getJSONObject(modifyProc);
            this.root.$content.html('');
            block.itemFromJSON(newRoot, this.root.$content, null);
        };
        /************ EDIT BLOCK TREE *************/
        block.prototype.insert = function (self, rng, edVal, blockName) {
            var _this = this;
            if (self.marks.findMark(rng.start).idx != self.marks.findMark(rng.end).idx)
                rng.start = rng.end;
            //data pro nove bloky
            var blText = new waObjs.text();
            blText.type = waObjs.itemType.text;
            blText.text = edVal.substring(rng.start, rng.end);
            var bl = new block();
            bl.name = blockName;
            bl.type = waObjs.itemType.block;
            bl.childs = [blText];
            var txt = new waObjs.text();
            txt.type = waObjs.itemType.text;
            txt.text = edVal.substr(rng.end);
            //strip puvodni blok
            self.setText(edVal.substr(0, rng.start));
            //uprav nahrad self 
            this.buildEditContent(function () {
                var selfIdx = _this.childs.indexOf(self);
                _this.childs.splice(selfIdx + 1, 0, bl, txt);
            });
        };
        block.prototype.delContent = function () {
            var _this = this;
            this.buildEditContent(function () { return _this.childs = []; });
        };
        block.prototype.delBracket = function () {
            var _this = this;
            this.buildEditContent(function () {
                var parChilds = _this.parent.childs;
                var childs = _this.childs;
                var selfIdx = parChilds.indexOf(_this);
                if (selfIdx == 0 || selfIdx == parChilds.length - 1 || parChilds[selfIdx - 1].type != waObjs.itemType.text || parChilds[selfIdx + 1].type != waObjs.itemType.text)
                    throw 'block not between two texts';
                if (childs.length > 0 && (childs[0].type != waObjs.itemType.text || childs[childs.length - 1].type != waObjs.itemType.text))
                    throw 'block not starts and ends with text';
                var parRes = [];
                for (var i = 0; i < selfIdx; i++)
                    parRes.push(parChilds[i]);
                for (var i = 0; i < childs.length; i++) {
                    if (i == 0) {
                        var it = (childs[i]);
                        var last = (parRes[parRes.length - 1]);
                        last.text += it.text;
                    }
                    else
                        parRes.push(childs[i]);
                }
                for (var i = selfIdx + 1; i < parChilds.length; i++) {
                    if (i == selfIdx + 1) {
                        var it = (parChilds[i]);
                        var last = (parRes[parRes.length - 1]);
                        last.text += it.text;
                    }
                    else
                        parRes.push(childs[i]);
                }
                _this.parent.childs = parRes;
            });
        };
        block.prototype.delAll = function () {
            var _this = this;
            this.buildEditContent(function () {
                var parChilds = _this.parent.childs;
                var selfIdx = parChilds.indexOf(_this);
                if (selfIdx == 0 || selfIdx == parChilds.length - 1 || parChilds[selfIdx - 1].type != waObjs.itemType.text || parChilds[selfIdx + 1].type != waObjs.itemType.text)
                    throw 'block not between two texts';
                var before = (parChilds[selfIdx - 1]);
                var after = (parChilds[selfIdx + 1]);
                before.text += after.text;
                parChilds.splice(selfIdx, 2);
            });
        };
        return block;
    })(waObjs.item);
    waObjs.block = block;
    //************* ROOT BLOCK *****************
    var rootBlock = (function (_super) {
        __extends(rootBlock, _super);
        function rootBlock(json, $parent, parent) {
            _super.call(this, json, $parent, parent);
            this.parent = parent;
            if (!json)
                return;
            this.$content = $parent;
            this.$content.on('click', '.sm-edit-block-lnk', function (ev) {
                var target = (ev.target);
                var $block = $(target.parentElement.parentElement);
                var bl = ($block.data('wa'));
                new waObjs.DlgEditBlock($(target), function (res) {
                    switch (res) {
                        case 'content':
                            bl.delContent();
                            break;
                        case 'bracket':
                            bl.delBracket();
                            break;
                        case 'both':
                            bl.delAll();
                            break;
                        default: throw 'not implemented';
                    }
                    return null;
                });
            });
        }
        rootBlock.prototype.toHTMLString = function () {
            return '<div class="sm-block-body"></div>';
        };
        rootBlock.prototype.myChildPlaceHolder = function () { return this.$self; };
        rootBlock.prototype.notifyDataChanged = function () {
            var _this = this;
            var self = this;
            if (self.refreshTimer)
                return;
            self.refreshTimer = setTimeout(function () {
                clearTimeout(self.refreshTimer);
                self.refreshTimer = 0;
                waCompile.compile(_this);
                var res = JSON.stringify(_this.compileResult, null, 2);
                $('#preview-content').text(res);
            }, 1);
        };
        return rootBlock;
    })(block);
    waObjs.rootBlock = rootBlock;
})(waObjs || (waObjs = {}));
