(function() {
    var Tabs = $we.Component.extend({
        el: '',
        index: 0,
        data: [],
        navTmpl: '',
        contentTmpl: '',
        _getNavEl: function() {
            return this.el.find('[data-role="nav"]');
        },
        _getNavEls: function() {
            return this.el.find('[data-toggle="tab"]');
        },
        _getCurrentIndex: function() {
            return this._getNavEl().find('.active').index();
        },
        _getTargetData: function(target) {
            target = $(target);

            return {
                flag: target.attr('data-flag'),
                id: target.attr('data-id')
            };
        },
        _onTabShown: function(e) {
            var data = {
                current: this._getTargetData(e.target),
                prev: this._getTargetData(e.relatedTarget)
            };

            this.fire('change', data);
        },
        setCurrentTitle: function(title) {
            var index = this._getCurrentIndex();
            this.setTitle(index, title);
        },
        setTitle: function(index, title) {
            this._getNavEls().eq(index).html(title);
        },
        initEvents: function() {
            var _this = this;
            this._getNavEls().on('shown', function(e) {
                _this._onTabShown(e);
            });
        },
        select: function(index) {
            if (isNaN(index)) {
                index = this.index;
            }
            this._getNavEls().eq(index).tab('show');
        },
        setData: function(data) {
            this.data = data;

            this.render();
        },
        getCurrentTabData: function() {
            var index = this._getCurrentIndex();
            return this.getTabData(index);
        },
        getTabData: function(index) {
            return this.data[index];
        },
        render: function() {
            var data = this.data;
            if (data.length) {
                var navHtmls = $(this.navTmpl).tmpl(data),
                    contentHtmls = $(this.contentTmpl).tmpl(data);

                this._getNavEl().html(navHtmls);
                this.el.find('[data-role="content"]').html(contentHtmls);
            }
        },
        doInit: function() {
            Tabs.superclass.doInit.apply(this, arguments);
            this.index = this.index || 0;

            this.select(this.index);
        }
    });

    $we.Tabs = Tabs;
    $we.autoRender('[data-role="tabs"]', Tabs, {
        index: 'number'
    }, true);
    $we.autoRender('[data-role="wejs-tabs"]', Tabs, {
        index: 'number'
    }, true);
})()
