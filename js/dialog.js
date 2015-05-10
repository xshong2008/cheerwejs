(function() {
    var tmpl = '<div class="modal hide fade" id="${id}" style="{{if width}}width:${width}px{{/if}}"><div class="modal-header" data-role="header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h4 data-role="title">${title}</h4></div><div class="modal-body" data-role="body" style="{{if height}}height:${this.height}px{{/if}}"></div>{{if hasFooter}}<div class="modal-footer" data-role="footer">{{each buttons}}<a href="javascript:void(0);" class="btn ${this.cls}" data-role="${this.name}">{{if this.icon}}<i class="icon ${this.icon}"</i>{{/if}}${this.text}</a>{{/each}}</div>{{/if}}</div>';

    var TMPL_NAME = 'wejs_dialog_template';
    var DIALOG_TEMPLATE = $.template(TMPL_NAME, tmpl);
    $we.apply($we, {
        modalShow: function(el) {
            el = $(el);
            el.modal('show');

            var ps = $we.getPageSize();
            var ml = (el.width()) / 2;
            el.css({
                marginLeft: -ml
            });
        },
        modalHide: function(el) {
            $(el).modal('hide');
        }
    });

    var DEFAULT_BUTTONS = {
        'sure': {
            text: '确定',
            cls: 'btn-primary',
            handler: 'doSure'
        },
        'cancel': {
            text: '取消',
            handler: 'doCancel'
        },
        'yes': {
            text: '确定',
            cls: 'btn-primary',
            handler: 'doSure'
        },
        'no': {
            text: '取消',
            handler: 'doCancel'
        }
    }
    Dialog = $we.Component.extend({
        content: '', //内容，如果配置了contentTmpl，则编译contentTmpl
        hasFooter: true, //是否有footer
        width: 0, //窗体宽度
        height: 0, //内容高度
        title: 'Dialog', //title
        buttons: ['sure', 'cancel'], //默认按钮
        contentTmpl: '', //内容的模板
        contentData: {}, //内容模板编译的数据，默认在getContentData方法中返回
        /**
         * {
         *     text:'确认',
         *     handler:'doSure',
         *     cls:'icon-primary',
         *     icon:'',
         *     name:'sure'//
         * }
         */
        _initButtons: function() {
            var buttons = [],
                _buttons = this.buttons,
                events = this.events;

            for (var i = 0, len = _buttons.length; i < len; i++) {
                var item = _buttons[i],
                    btn = DEFAULT_BUTTONS[item];

                if (btn) {
                    events.push({
                        event: 'click',
                        handler: btn.handler,
                        selector: '[data-role="' + item + '"]'
                    });
                    item = {
                        text: btn.text,
                        name: item,
                        cls: btn.cls
                    };
                } else {
                    events.push({
                        event: 'click',
                        handler: item.handler,
                        selector: '[data-role="' + item.name + '"]'
                    });
                }

                buttons.push(item);
            }
            this.buttons = buttons;
        },
        getElBy: function(dataRole, el) {
            el = el || this.el;
            return el.find('[data-role="' + dataRole + '"]');
        },
        getBodyEl: function() {
            return this.getElBy('body');
        },
        getHeaderEl: function() {
            return this.getElBy('header');
        },
        getTitleEl: function() {
            var headerEl = this.getHeaderEl();
            this.getElBy('title', headerEl);
        },
        getFooterEl: function() {
            return this.getElBy('footer');
        },
        getButtonElByFlag: function(dataRole) {
            var footerEl = this.getFooterEl();
            return this.getElBy(dataRole, footerEl);
        },
        getTitle: function() {
            return this.getTitleEl().text();
        },
        /**
         * 获取body区域的表单数据
         * @param  {boolean} convertEmpty 是否包含空数据
         * @return {[type]}              [description]
         */
        getFormData: function(convertEmpty) {
            return $we.Form.getData(this.getBodyEl(convertEmpty));
        },
        /**
         * 设置body区域的表单数据
         * @param {Object}  data    源数据
         * @param {Boolean} isCover 是否全覆盖，设置为全覆盖的时候，表单项的数据在data中找不但则置空
         */
        setFormData: function(data, isCover) {
            $we.Form.setData(this.getBodyEl(), data, isCover);
        },
        /**
         * 设置标题
         * @param {[type]} title [description]
         */
        setTitle: function(title) {
            this.getTitleEl().html(title);
        },
        /**
         * 设置内容
         * @param {[type]} content [description]
         */
        setContent: function(content) {
            debugger;
            this.content = content;
            this.getBodyEl().html(content);
        },
        getContent: function() {
            return this.getBodyEl().html();
        },
        show: function() {
            $we.modalShow(this.el);
        },
        hide: function() {
            $we.modalHide(this.el);
        },
        getContentData: function() {
            return this.contentData;
        },
        doInit: function() {
            if (!this.el) {
                this._initButtons();
                var htmls = $.tmpl(TMPL_NAME, {
                    id: this.id,
                    title: this.title,
                    width: this.width,
                    height: this.height,
                    hasFooter: this.hasFooter,
                    buttons: this.buttons
                });

                $(document.body).append(htmls);
                this.el = $('#' + this.id);
            }
            Dialog.superclass.doInit.apply(this, arguments);
        },
        doCancel: function(e) {
            this.hide();
        },
        doSure: function(e) {},
        render: function(data) {
            var content = this.content;
            if (this.contentTmpl) {
                var data = data || this.getContentData();
                content = $(this.contentTmpl).tmpl(data);
            }

            this.getBodyEl().html(content);
        }
    });
    /**
     * 创建并显示Dialog
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    Dialog.create = function(config) {
        var dialog = new Dialog(config);
        dialog.show();
        return dialog;
    };

    var alertIns = null;

    /**
     * 模态对话框的alert
     * @param  {String} config.title       标题
     * @param  {String} config.content     内容
     * @param  {String} config.contentTmpl 内容模板
     * @param  {Object} config.data        模板渲染数据
     * @param  {Function} config.callback    点击按钮的回调方法
     */
    Dialog.alert = function(config) {
        $we.apply(config, {
            buttons: ['yes'],
            doSure: function(e) {
                this.callback && this.callback();
            }
        });

        if (!alertIns) {
            alertIns = Dialog.create(config);
        } else {
            alertIns.set(config);
        }
        alertIns.render();
        alertIns.show();
    };

    var confirmIns = null;
    /**
     * 模态对话框的confirm
     * @param  {String} config.title       标题
     * @param  {String} config.content     内容
     * @param  {String} config.contentTmpl 内容模板
     * @param  {Object} config.data        模板渲染数据
     * @param  {Function} config.callback    点击按钮的回调方法
     */
    Dialog.confirm = function(config) {
        $we.apply(config, {
            buttons: ['yes', 'no'],
            doCancel: function() {
                this.callback && this.callback(false);
            },
            doSure: function(e) {
                this.callback && this.callback(true);
            }
        });
        if (!confirmIns) {
            confirmIns = Dialog.create(config);
        } else {
            confirmIns.set(config);
        }
    };

    $we.Dialog = Dialog;
})();
