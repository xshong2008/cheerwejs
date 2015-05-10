(function() {
    $we.AutoComplete = $we.Component.extend({
        url: '',
        data: '',
        delay: 300,
        name: '',
        paramName: 'key', //异步参数名称
        itemsCount: 10,
        textField: '',
        valueField: '',
        filterType: 'remote',
        _delayFilter: null,
        _currentIndex: -1,
        _onKeyup: function() {
            var _this = this;
            if (this._delayFilter) {
                clearTimeout(this._delayFilter);
                this._delayFilter = null;
            }
            this._delayFilter = setTimeout(function() {
                _this.filter();
            }, this.delay);
        },
        /**
         * 获取下拉菜单组件EL
         * @return {[type]} [description]
         */
        _getDDMenuEl: function() {
            return $('#' + this.id + '-ddmenu');
        },
        _getHiddenEl: function() {
            return $('#' + this.id + '-val');
        },
        _doSelect: function(event) {
            var target = $(event.currentTarget),
                index = target.attr('data-index'),
                txt = target.text(),
                val = target.attr('data-val');

            this.el.val(txt);
            this._getHiddenEl().val(val);
            this._currentIndex = index;
            this._getDDMenuEl().hide();
        },

        /**
         * 初始化DDMenu
         */
        _initDDMenu: function() {
            var ddmenu = this._getDDMenuEl();

            if (!ddmenu.length) {
                this.el.after(['<ul id="', this.id, '-ddmenu" class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"></ul>'].join(''));

                this._getDDMenuEl().on('click', 'a', {
                    scope: this,
                }, function(event) {
                    var scope = event.data.scope;

                    scope._doSelect(event);
                })
            }
        },
        _initHidden: function() {
            this.el.get(0).name = '';
            this.el.after(['<input type="hidden" value="" name="', this.name, '" id="', this.id, '-val"/>'].join(''));
        },
        /**
         * 获取选中的data
         * @return {[type]} [description]
         */
        getSelected: function() {
            return this._currentIndex !== -1 ? this.data[this._currentIndex] : null;
        },
        /**
         * 事件初始化
         * @return {[type]} [description]
         */
        initEvents: function() {
            this.el.on('keyup', {
                scope: this,
                handler: this._onKeyup,
            }, function(event) {
                var data = event.data;
                data.handler.call(data.scope);
            });
        },
        /**
         * 过滤
         */
        filter: function() {
            var el = this.el,
                offset = el.offset();

            offset.top += el.outerHeight();

            switch (this.filterType) {
                case 'remote':
                    this.loadData();
                    break;
                default:
                    this.matchData();
                    break;
            }

            this._getDDMenuEl()
                .show()
                .width(this.el.outerWidth())
                .offset(offset);
        },
        /**
         * 对即将渲染的数据进行排序
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        sorterData: function(data) {
            return data;
        },
        /**
         * 静态数据的过滤
         * @return {[type]} [description]
         */
        matchData: function() {
            var inputVal = this.el.val(),
                data = this.data,
                matchData = [],
                len = Math.min(data.length, this.itemsCount);

            for (var i = 0; i < len; i++) {
                var item = data[i],
                    typeItem = typeof(item),
                    txt = item[this.textField],
                    val = item[this.valueField];

                if (typeof(item) != 'object') {
                    txt = item;
                    val = item;
                }


                if (val.indexOf(inputVal) != -1) {
                    matchData.push(item);
                }
            }

            this.sorterData(matchData);

            this.renderData(matchData);
        },
        /**
         * 异步获取远程数据
         */
        loadData: function() {
            var data = {
                '__key': this.el.val()
            };

            this.data = [];
            $we.ajax({
                url: this.url,
                data: data,
                type: 'POST',
                scope: this,
                onSuccess: function(ret) {
                    this.data = ret.data;
                },
                onComplete: function() {
                    this.sorterData(this.data);
                    this.renderData(this.data);
                }
            });
        },
        /**
         * 渲染数据
         * @param  {[type]} data [description]
         */
        renderData: function(data) {
            this._initDDMenu();

            var len = Math.min(data.length, this.itemsCount),
                htmls = [];

            // htmls.push('<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu">');
            for (var i = 0; i < len; i++) {
                var item = data[i],
                    typeItem = typeof(item),
                    txt = item[this.textField],
                    val = item[this.valueField];

                if (typeof(item) != 'object') {
                    txt = item;
                    val = item;
                }

                htmls.push([
                    '<li><a tabindex="-1" href="#" data-val="', val, '" data-index="', i, '">', txt, '</a></li>'
                ].join(''));
            }
            // htmls.push('</ul>');
            htmls = htmls.join('');

            this._getDDMenuEl().html(htmls);
        },
        /**
         * 初始化数据
         * @return {[type]} [description]
         */
        doInit: function() {
            $we.AutoComplete.superclass.doInit.apply(this);

            this._initDDMenu();
            if (this.el.get(0).name) {
                this._initHidden();
            }
        }
    });



    var selector = '[data-role="wejs-autocomplete"]';
    $we.autoRender(selector, $we.AutoComplete, {
        name: '',
        deploy: 'number',
        valueField: 'string',
        textField: 'string',
        data: 'object',
        url: 'string',
        filterType: 'string',
        events: ['change']
    });
})()
