var TreeView;
(function (TreeView) {
    function nodeToData(nd) {
        var res = {};
        for (var n in nd.data)
            res[n] = nd.data[n];
        res.Title = nd.title();
        res.isNew = nd.isNew;
        res.Items = _.map(nd.items(), function (it) { return nodeToData(it); });
        return res;
    }
    function path(self) {
        if (!self)
            return '... missing ...';
        var res = self.Title;
        while (self.parent != null) {
            self = self.parent;
            res = self.Title + ' / ' + res;
        }
        return res;
    }
    TreeView.path = path;
    function root(self) {
        while (self.parent)
            self = self.parent;
        return self;
    }
    TreeView.root = root;
    function adjustParents(self, parent) {
        if (!self)
            return;
        self.parent = parent;
        if (self.Items)
            _.each(self.Items, function (it) { return adjustParents(it, self); });
    }
    TreeView.adjustParents = adjustParents;
    function findNode(root, cond) {
        if (!root)
            return null;
        if (cond(root))
            return root;
        if (!root.Items)
            return null;
        for (var i = 0; i < root.Items.length; i++) {
            var res = findNode(root.Items[i], cond);
            if (res != null)
                return res;
        }
    }
    TreeView.findNode = findNode;
    var Model = (function () {
        function Model(data, isNew, isLocked, options) {
            this.options = options;
            this.refreshCutPaste = ko.observable(0); //fake observable pro vynuceni aktualizace nekterych computed observables
            this.root = new Node(data, null, this, isNew, isLocked);
        }
        Model.prototype.getResult = function () {
            return nodeToData(this.root);
        };
        Model.prototype.getJSON = function () {
            return JSON.stringify(this.getResult());
        };
        Model.prototype.cutCopy = function (nd, isCut) {
            try {
                if (this.cutCopied == nd && this.isCut == isCut) {
                    this.cutCopied = null;
                    nd.cutCopyFlag('');
                    return;
                }
                if (this.cutCopied != null)
                    this.cutCopied.cutCopyFlag('');
                if (nd)
                    nd.cutCopyFlag(isCut ? 'cut' : 'copy');
                this.cutCopied = nd;
                this.isCut = isCut;
            }
            finally {
                this.refreshCutPaste(this.refreshCutPaste() + 1); //zmena fake property -> prepocet CutPaste ikonek
            }
        };
        Model.prototype.paste = function (nd, isFirst) {
            var cutCopied = this.cutCopied;
            var isCut = this.isCut;
            cutCopied.cutCopyFlag('');
            if (isCut) {
                cutCopied.parent.items.remove(cutCopied);
                cutCopied.parent.adjustIcon();
            }
            else {
                var dt = nodeToData(cutCopied);
                cutCopied = new Node(dt, null, this, true, null);
            }
            if (isFirst) {
                nd.items.splice(0, 0, cutCopied);
                nd.adjustIcon();
                cutCopied.parent = nd;
            }
            else {
                nd.parent.items.splice(nd.parent.items.indexOf(nd) + 1, 0, cutCopied);
                nd.parent.adjustIcon();
                cutCopied.parent = nd.parent;
            }
            this.cutCopied = null;
            this.refreshCutPaste(this.refreshCutPaste() + 1); //zmena fake property -> prepocet CutPaste ikonek
        };
        Model.prototype.hover = function (nd, ishover) {
            if (ishover) {
                if (this.hovered == nd)
                    return;
                if (this.hovered)
                    this.hovered.hovered(false);
                this.hovered = nd;
                nd.hovered(true);
            }
            else {
                if (this.hovered == nd) {
                    this.hovered = null;
                    nd.hovered(false);
                }
            }
        };
        Model.prototype.edit = function (nd) {
            var self = this;
            if (this.edited == nd)
                return;
            if (this.edited) {
                var el = this.edited.editElement;
                el.text(this.edited.title());
            }
            if (nd) {
                var el = nd.editElement;
                var inputbox = "<input type='text' class='inputbox' value=\"" + nd.title() + "\">"; //Insert the HTML into the div 
                el.html(inputbox);
                var input = el.find("input.inputbox");
                input.click(function () { return false; }); //spolkni click
                input.focus(); //Immediately give the input box focus
                input.keydown(function (ev) {
                    if (ev.keyCode == 13) {
                        var value = input.val();
                        nd.title(value);
                        nd.title.valueHasMutated();
                        self.edited = null;
                    }
                    else if (ev.keyCode == 27) {
                        el.html(nd.title());
                        self.edited = null;
                    }
                });
            }
            this.edited = nd;
        };
        return Model;
    })();
    TreeView.Model = Model;
    function hasIsLocked(nd) {
        return _.any(nd.items(), function (it) { return it.isLocked || hasIsLocked(it); });
    }
    var Node = (function () {
        function Node(data, parent, model, isNew, isLocked) {
            this.data = data;
            this.parent = parent;
            this.model = model;
            this.isNew = isNew;
            this.checked = ko.observable(false);
            this.hovered = ko.observable(false);
            this.expanded = ko.observable(true);
            this.selected = ko.observable(false);
            this.icon = ko.observable('');
            //*********** Checbox management
            this.explicitOnChecked = false;
            //*********** CopyPaste
            this.cutCopyFlag = ko.observable(null);
            //naplneni dat
            var self = this;
            this.isLocked = (isLocked ? isLocked(data) : false);
            self.title = ko.observable(data.Title);
            self.items = data.Items ? ko.observableArray(_.map(data.Items, function (it) { return new Node(it, self, model, isNew, isLocked); })) : ko.observableArray();
            //inicializace fieldu
            self.adjustIcon();
            //Checked
            self.checked.subscribe(self.onChecked, self);
            //Expand
            self.expanded.subscribe(function (isExp) { self.adjustIcon(); });
            //Display Tools
            self.displayDelete = this.testDisplay(function () { return !self.isLocked && !!self.parent && !hasIsLocked(self); });
            self.displayEdit = ko.computed(function () { return true; });
            self.displayAddNext = this.testDisplay(function () { return !!self.parent; });
            self.displayAddFirst = ko.computed(function () { return true; });
            self.displayCut = this.testDisplay(function () { return !!self.parent; });
            self.displayCopy = ko.computed(function () { return true; });
            self.displayPasteFirst = this.testDisplay(function () {
                var cutCopied = self.model.cutCopied;
                var isCut = self.model.isCut;
                if (cutCopied == null)
                    return false;
                if (!isCut)
                    return true;
                var ptr = self;
                while (ptr != null) {
                    if (ptr == cutCopied)
                        return false;
                    ptr = ptr.parent;
                }
                return true;
            });
            self.displayPasteNext = this.testDisplay(function () { return !!self.parent && self.displayPasteFirst(); });
            //prida metody jmene itsMeHover a itsMeEdit k modelu. Ty pak zajisti volani registerElement('Hover', el), coz je sance zaregistrovat nebo pouzit element.
            ko_bindingHandlers_itsMe_register(self, ['Hover', 'Edit']);
        }
        //*********** basic opers
        Node.prototype.hover = function (ishover) { this.model.hover(this, ishover); };
        Node.prototype.expandCollapse = function () { this.expanded(!this.expanded()); };
        Node.prototype.testDisplay = function (cond) {
            var _this = this;
            return ko.computed(function () {
                if (!_this.model.options.editable)
                    return false; //netestuje se pro not editable mode
                if (_this.model.refreshCutPaste() < 0)
                    return false; //sideefekt / prepocitani computed observable
                return cond();
            });
        };
        //inicializace dulezituch HTML tagu
        Node.prototype.registerElement = function (itsMeName, el) {
            var _this = this;
            switch (itsMeName) {
                case "Hover":
                    $(el).hover(function () { return _this.hover(true); }, function () { return _this.hover(false); });
                    break;
                case "Edit":
                    this.editElement = $(el);
                    break;
            }
        };
        //*********** Helper
        Node.prototype.hasChild = function () { return this.items().length > 0; };
        Node.prototype.adjustIcon = function () { this.icon(this.hasChild() ? (this.expanded() ? 'folder-open' : 'folder') : 'book'); };
        Node.prototype.displayTools = function () { return this.model.options.editable && this.hovered() && this.model.edited != this; };
        Node.prototype.doEdit = function () { this.model.edit(this); };
        Node.prototype.doDelete = function () { this.parent.items.remove(this); this.parent.adjustIcon(); };
        Node.prototype.doAddNext = function () {
            var nd = new Node({ Items: null, Title: 'New Item', isNew: undefined }, this.parent, this.model, true, null);
            this.parent.items.splice(this.parent.items.indexOf(this) + 1, 0, nd);
            this.parent.adjustIcon();
            nd.doEdit();
        };
        Node.prototype.doAddFirst = function () {
            var nd = new Node({ Items: null, Title: 'New Item', isNew: undefined }, this, this.model, true, null);
            this.items.splice(0, 0, nd);
            this.adjustIcon();
            nd.doEdit();
        };
        Node.prototype.onChecked = function (checked) {
            if (this.explicitOnChecked)
                return;
            //if (!!this.items) _.forEach(this.itemsLow(), i => i.checked(checked));
            //if (!!this.items) _.forEach(this.items(), i => i.checked(checked));
            _.forEach(this.items(), function (i) { return i.checked(checked); });
            if (this.parent)
                this.parent.onChildChecked();
        };
        Node.prototype.onChildChecked = function () {
            this.explicitOnChecked = true;
            this.checked(this.allChildrenChecked());
            this.explicitOnChecked = false;
            if (this.parent)
                this.parent.onChildChecked();
        };
        //allChildrenChecked(): boolean { return _.all(this.itemsLow(), i => i.checked()); }
        Node.prototype.allChildrenChecked = function () { return _.all(this.items(), function (i) { return i.checked(); }); };
        Node.prototype.doCut = function () { this.model.cutCopy(this, true); };
        Node.prototype.doCopy = function () { this.model.cutCopy(this, false); };
        Node.prototype.doPasteFirst = function () { this.model.paste(this, true); };
        Node.prototype.doPasteNext = function () { this.model.paste(this, false); };
        return Node;
    })();
    TreeView.Node = Node;
})(TreeView || (TreeView = {}));
