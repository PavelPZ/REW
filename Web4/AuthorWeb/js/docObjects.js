var waObjs;
(function (waObjs) {
    //************* interfaces *****************
    (function (itemType) {
        itemType[itemType["text"] = 0] = "text";
        itemType[itemType["block"] = 1] = "block";
        itemType[itemType["rootBlock"] = 2] = "rootBlock";
    })(waObjs.itemType || (waObjs.itemType = {}));
    var itemType = waObjs.itemType;
    var IItemProps = ['type'];
    waObjs.ITextProps = ['text'].pushArray(IItemProps);
    waObjs.IBlockProps = ['name', 'pars'].pushArray(IItemProps);
    //************* ITEM *****************
    var item = (function () {
        function item(json, $parent, parent) {
            this.parent = parent;
            this.selfProps = IItemProps; //property names pro JSON serializaci. Serializuji se pouze tyto props, ostatni se ignoruji. Virtualni dato, pouzito v getJSONObject();
            if (!json)
                return;
            this.root = parent ? parent.root : this;
            if (json)
                for (var p in json)
                    this[p] = json[p];
            this.$self = $(this.toHTMLString());
            this.$self.data('wa', this);
            $parent.append(this.$self);
        }
        item.prototype.toHTMLString = function () { return ''; }; //vrati HTML fragment pro $self
        item.prototype.refreshPropsFromHtml = function () { }; //z HTML prevezme data pro JSON serializaci
        item.prototype.getJSONObject = function (modify) {
            var _this = this;
            if (modify === void 0) { modify = null; }
            if (modify)
                modify();
            var res = {};
            _.each(this.selfProps, function (p) { return res[p] = _this[p]; });
            var chs = this['childs'];
            if (chs)
                res['childs'] = _.map(chs, function (ch) { return ch.getJSONObject(); });
            return res;
        };
        return item;
    })();
    waObjs.item = item;
    //************* test *****************
    function test() {
        $(function () {
            var item = waObjs.block.itemFromJSON(testJson, $('#edit-content'), null);
            //new metaJS.propEditor($('#prop-editor > .sm-text'), 'gap-fill', 'id=gp1; smart-width=sw1');
            //testJson = item.getJSONObject();
            //Utils.longLog(JSON.stringify(testJson, null, 2));
            //$('#edit-content').html('');
            //block.itemFromJSON(testJson, $('#edit-content'), null);
        });
    }
    waObjs.test = test;
    var testJson = {
        type: itemType.rootBlock, name: '', pars: '',
        childs: [
            //{ type: itemType.text, text: '{+gap-fill(id=gp; smart-width=sw1;)}' },
            { type: itemType.text, text: '{+offering(drop-down-mode=discard)}' },
        ]
    };
})(waObjs || (waObjs = {}));
