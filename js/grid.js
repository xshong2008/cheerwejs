(function() {
    var DR_GRID = '[data-role="grid"]', //grid list
        DR_GRID_LIST = '[data-role="grid-list"]', //list
        DR_GRID_ITEM = '[data-role="grid-item"]', //list
        DR_GRID_PAGEBAR = '[data-role="grid-pagebar"]',
        // DR_GRID_ROW_TMPL = '[data-role="grid-row-tmpl"]', //grid-row
        DR_EMPTY_INFO = '[data-role="empty-info"]', //empty

        DR_BTN_DEL = '[data-role="btn-del"]', //btn-del
        DR_ROW_CHECKBOX = '[data-role="row-checkbox"]',
        DR_ALL_CHECKBOX = '[data-role="all-checkbox"]',
        CLS_ROW_SELECTED = 'grid-row-selected';

    $we.Grid = $we.Component.extend({
        url: '',
        autoLoad: false,

        gridRowTmpl: '#grid_row_tmpl',
        hasPagebar: false,
        pageSize: 20,
        pageIndex: 0,

        data: [], //GRID的数据
        _dataMap: {}, //GRID的数据的MAP
        _ajaxRet: {}, //GRID加载数据时的异步结果

        events: [{
            event: 'click',
            selector: DR_BTN_DEL,
            handler: '_doDel'
        }, {
            event: 'click',
            selector: DR_GRID_ITEM,
            handler: '_doSelectRow'
        }, {
            event: 'click',
            selector: DR_ALL_CHECKBOX,
            handler: '_doSelectAllRow'
        }],
        _createMap: function(rows) {
            var map = {};
            for (var i = 0, len = rows.length; i < len; i++) {
                var row = rows[i];
                row.id = row.id || $we.createId();

                map[row.id] = row;
            }
            return map;
        },
        _cacheData: function(rows) {
            this.data = rows;
            this._dataMap = this._createMap(rows);
        },
        _doSelectRow: function(e) {
            var data = this._getEventData(e),
                el = data.el,
                isSelected = !el.hasClass(CLS_ROW_SELECTED),
                chkEl = data.el.find(DR_ROW_CHECKBOX);


            if (chkEl.length) {
                chkEl = chkEl.get(0);
                chkEl.checked = isSelected;
            }

            if (isSelected) {
                el.addClass(CLS_ROW_SELECTED);
            } else {
                el.removeClass(CLS_ROW_SELECTED);
            }

            data.isSelected = isSelected;
            this.fire('select', data);
        },
        _doSelectAllRow: function(e) {
            var el = e.target;
            if (el.checked) {
                this.selectAll();
            } else {
                this.clearSelected();
            }
        },
        _getDataIdByEl: function(el) {
            return el.attr('data-id');
        },
        _getEventData: function(e) {
            var el = $(e.currentTarget),
                id = this._getDataIdByEl(el);

            return {
                el: el,
                id: id
            };
        },
        /**
         * 获取选中的行的DOM元素
         * @return {[type]} [description]
         */
        _getSelectedRowEl: function() {
            return this.el.find(DR_GRID_ITEM).filter('.' + CLS_ROW_SELECTED);
        },
        /**
         * 获取所有行元素
         * @return {[type]} [description]
         */
        _getAllRowEl: function() {
            return this.el.find(DR_GRID_ITEM);
        },
        /**
         * 获取选中的Checkbox的DOM元素
         * @return {[type]} [description]
         */
        _getSelectedCheckboxEl: function() {
            return this.el.find(DR_GRID_ITEM).find(DR_ROW_CHECKBOX + ':checked');
        },
        /**
         * 获取所有Checkbox元素
         * @return {[type]} [description]
         */
        _getAllCheckboxEl: function() {
            return this.el.find(DR_GRID_ITEM).find(DR_ROW_CHECKBOX);
        },
        _doDel: function(e) {},
        _renderList: function(rows) {
            var htmls = $(this.gridRowTmpl).tmpl(rows);
            this.el.find(DR_GRID_LIST).html(htmls);
        },
        getData: function() {
            return this.data;
        },
        setData: function(data, total) {
            //缓存数据
            this._cacheData(data);

            this.renderData(data);

            if (this.pagebar) {
                this.pagebar.setTotal(total);
            }
        },
        getRow: function(index) {
            if (this.data) {
                return this.data[index];
            }
            return null;
        },
        getRowById: function(id) {
            return this._dataMap[id];
        },
        /**
         * 获取选中行的数据
         * @return {[type]} [description]
         */
        getSelectedRow: function() {
            var dataList = [],
                _this = this;

            this._getSelectedRowEl().each(function() {
                var id = _this._getDataIdByEl($(this)),
                    data = _this.getRowById(id);

                if (data) {
                    dataList.push(data);
                }
            });

            return dataList;
        },
        getSelectedIds: function() {
            var ids = [],
                _this = this;

            this._getSelectedRowEl().each(function() {
                var id = _this._getDataIdByEl($(this));

                if (id) {
                    ids.push(id);
                }
            });

            return ids;
        },
        /**
         * 反选
         * @return {[type]} [description]
         */
        invertRow: function() {
            this._getAllRowEl().each(function() {
                var el = $(this);
                if (el.hasClass(CLS_ROW_SELECTED)) {
                    el.removeClass(CLS_ROW_SELECTED);
                    el.find(DR_ROW_CHECKBOX).attr('checked', false);
                } else {
                    el.addClass(CLS_ROW_SELECTED);
                    el.find(DR_ROW_CHECKBOX).attr('checked', true);
                }
            });
        },
        /**
         * 全选
         * @return {[type]} [description]
         */
        selectAll: function() {
            this._getAllRowEl().addClass(CLS_ROW_SELECTED);
            this._getAllCheckboxEl().attr('checked', true);
        },
        /**
         * 清除选择
         * @return {[type]} [description]
         */
        clearSelected: function() {
            this._getSelectedRowEl().removeClass(CLS_ROW_SELECTED);
            this._getSelectedCheckboxEl().attr('checked', false);
        },
        /**
         * 添加数据
         * @param {[type]} row [description]
         */
        addRow: function(row) {
            this.data.push(row);
            row.id = row.id || $we.createId();
            this._dataMap[row.id] = row;

            this.renderData(this.data);
        },
        /**
         * 移除数据
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        removeRow: function(index) {
            var indexList = [].concat(index);

            for (var i = 0, len = indexList.length; i < len; i++) {
                var index = indexList[i],
                    row = this.getRow(index);

                if (row) {
                    this.data.splice(index, 1);
                    delete this._dataMap[row.id];
                }
            }

            this.renderData(this.data);
        },
        /**
         * 移除数据根据ID
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        removeRowById: function(id) {
            var data = this.data,
                idList = [].concat(id),
                idMap = {},
                dataList = [];

            for (var i = 0, len = idList.length; i < len; i++) {
                idMap[idList[i]] = true;
            }

            for (var i = 0, len = data.length; i < len; i++) {
                var row = data[i];
                if (idMap[row.id]) {
                    delete this._dataMap[row.id];
                } else {
                    dataList.push(row);
                }
            }
            this.data = dataList;

            this.renderData(this.data);
        },
        /**
         * 异步记载后的渲染方法
         * @param  {[type]} rows [description]
         * @return {[type]}      [description]
         */
        renderData: function(rows) {
            var el = this.el;
            if (rows.length) {
                el.find(DR_GRID).show();
                el.find(DR_EMPTY_INFO).hide();
                //render list
                this._renderList(rows);
            } else {
                el.find(DR_GRID).hide();
                el.find(DR_EMPTY_INFO).show();

                this._renderList([]);
            }
        },
        load: function(params) {
            $we.mask('loading');

            var data = {};

            $we.apply(data, params);

            if (this.hasPagebar) {
                $we.apply(data, {
                    pageSize: this.pageSize,
                    pageIndex: this.pageIndex
                });
            }

            $we.ajax({
                scope: this,
                data: data,
                dataType: 'json',
                url: this.url,
                type: 'POST',
                onSuccess: function(ret) {
                    this._ajaxRet = ret;

                    var rows = ret.data.rows,
                        total = ret.data.total;

                    this.setData(rows, total);

                    this.fire('load-succ', ret);
                },
                onFail: function(ret) {
                    this.fire('load-fail', ret);
                },
                onComplete: function() {
                    $we.mask('hide');
                }
            });
        },
        createPagebar: function() {
            if (!this.hasPagebar) {
                return;
            }
            if (!this.pagebar) {
                this.pagebar = new $we.Pagebar({
                    el: this.el.find(DR_GRID_PAGEBAR),
                    pageSize: this.pageSize,
                    pageIndex: this.pageIndex
                });

                this.pagebar.on('change', function(data) {

                    var pageData = data.eventData;

                    this.pageIndex = pageData.newIndex;

                    this.load();

                }, this);
            }
        },
        doInit: function() {
            $we.Grid.superclass.doInit.apply(this, arguments);
            this.createPagebar();

            if (this.autoLoad) {
                this.load();
            }
        }
    });

    $we.autoRender('[data-role="wejs-grid"]', $we.Grid, {
        autoLoad: 'boolean',
        url: 'string',
        autoLoad: 'boolean',
        gridRowTmpl: 'string',
        hasPagebar: 'boolean',
        pageSize: 'number',
        pageIndex: 'number',
        data: 'object', //GRID的数据
    });

})();
