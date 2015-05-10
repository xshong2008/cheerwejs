(function() {
    $we.Select = $we.Component.extend({
        url: '',
        textField: '',
        valueField: '',
        data: [],
        nullText: '请选择...',
        autoLoad: true,
        params: {},
        value: '', //初始化时的value
        isAsync: false, //是否是异步请求
        setData: function(data) {
            this.data = data;

            this._renderData(data);
        },
        getData: function() {
            return this.data;
        },
        getItem: function(value) {
            var valueField = this.valueField;
            var list = this.getDataBy(function(item, index, data) {
                return (item[valueField] == value)
            });

            if (list.length) {
                return list[0];
            }
            return null;
        },
        getDataBy: function(fn) {
            var data = this.data,
                list = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i];

                if (fn.call(this, item, i, data)) {
                    list.push(item);
                }
            }
            return list;
        },
        getValue: function() {
            return this._getSelectEl().val
        },
        load: function(params) {
            params = $.extend({}, this.params, params);

            $we.ajax({
                async: this.isAsync,
                url: this.url,
                data: params,
                type: 'POST',
                scope: this,
                onSuccess: this._loadSuccess,
                onFail: this._onFail
            });
        },
        _getSelectEl: function() {
            var el = this._selectEl;

            if (!el) {
                if (this.el.get(0).tagName.toLowerCase() == 'select') {
                    el = this.el;
                } else {
                    el = this.el.find('select:firset');
                }
                this._selectEl = el;
            }

            return el;
        },
        _renderData: function(data) {
            var el = this._getSelectEl().get(0),
                textField = this.textField,
                valueField = this.valueField,
                options = el.options;

            if (this.nullText) {
                options.add(new Option(this.nullText, ''));
            }
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i],
                    text = item[textField],
                    value = item[valueField];

                options.add(new Option(text, value));
            }
        },
        _loadSuccess: function(ret) {
            var data = ret.data.rows;

            this.setData(data);
        },
        _loadFail: function(ret) {
            this.setData([]);
        },

        doInit: function() {
            $we.Select.superclass.doInit.call(this);

            if (this.autoLoad) {
                this.load();
            }

            if (this.value) {
                this.setValue(value);
            }
        }
    });

    var selector = '[data-role="wejs-select"]';
    $we.autoRender(selector, $we.Select, {
        name: 'string',
        url: 'string',
        textField: 'string',
        valueField: 'string',
        autoLoad: 'boolean',
        isAsync: 'boolean',
        value: 'string',
        params: 'object',
        nullText: 'string',
        data: 'object'
    });
})();
