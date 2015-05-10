(function($we, $) {
	var createPager = function(i) {
		var cls = i == this.getPageIndex() ? "active" : '';
		return [
			'<li i="', i, '" id="', this.id, '_page_', i, '" class="', cls, '">',
			'<a href="javascript:void(0);">' + (i + 1) + '</a>',
			'</li>'
		].join('');
	};

	$we.Pagebar = $we.extend($we.Component, {
		cls: 'pagination',
		total: 0,
		pageIndex: 0,
		pageSize: 20,
		__sizeShow: 10,
		infoTmpl: '<span class="info">第{pageIndex}页，每页{pageSize}条，共{total}条记录</span>',
		events: [{
			event: 'click',
			selector: 'li',
			handler: '__doClickPageIndex'
		}],
		__doClickPageIndex: function(e) {
			var i = $(e.currentTarget).attr('i');
			if (i) {
				this.__doChangeIndex(i);
			}
		},
		__doChangeIndex: function(i) {
			i -= 0;
			var oldIndex = this.getPageIndex();
			var newIndex = i;
			this.setPageIndex(i);
			this.__render();

			this.fire('change', {
				oldIndex: oldIndex,
				newIndex: newIndex,
				pageSize: this.getPageSize()
			});
		},
		__render: function() {
			var pageCount = this.getPageCount();
			var pageSize = this.getPageSize();
			var pageIndex = this.getPageIndex();
			var firstCls = pageIndex == 0 ? 'disabled' : '';
			var lastCls = pageIndex == pageCount - 1 ? 'disabled' : '';

			var htmls = [
				'<ul>'
			];
			htmls.push('<li class="' + firstCls + '" i="0"><a href="javascript:void(0);">&laquo;</a></li>');
			if (pageCount < this.__sizeShow) { //小于10条
				for (var i = 0; i < pageCount; i++) {
					htmls.push(createPager.call(this, i));
				}
			} else {

				var _sub = this.__sizeShow / 2; //5

				var start = pageIndex - _sub + 1;
				var end = pageIndex + _sub - 1;
				if (pageIndex >= _sub) {
					htmls.push('<li><a>...</a></li>');
				}

				if (start < 0) {
					end -= start;
					start = 0;
				}
				if (end >= pageCount) {
					start -= (end - pageCount + 1);
					end = pageCount - 1;
				}
				while (start <= end) {
					htmls.push(createPager.call(this, start));
					start++
				}
				if (pageIndex < pageCount - _sub) {
					htmls.push('<li><a>...</a></li>');
				}
			}
			htmls.push('<li class="' + lastCls + '" i="' + (pageCount - 1) + '"><a href="javascript:void(0);">&raquo;</a></li>');
			htmls.push('</ul>');

			if (this.infoTmpl) {
				htmls.push($we.parse(this.infoTmpl, {
					pageCount: pageCount,
					pageSize: pageSize,
					pageIndex: this.getPageIndex() + 1,
					total: this.getTotal(),
					start: start,
					end: end
				}));
			}

			return htmls.join('');
		},

		setTotal: function(total) {
			this.total = total;
			this.render();
		},
		getTotal: function() {
			return this.total;
		},
		setPageIndex: function(pageIndex) {
			if (pageIndex < this.getPageCount()) {
				this.pageIndex = pageIndex;
			}
		},
		getPageIndex: function() {
			return this.pageIndex;
		},
		setPageSize: function(pageSize) {
			this.pageSize = pageSize;
		},
		getPageSize: function() {
			return this.pageSize;
		},
		getParams: function() {
			return {
				pageIndex: this.pageIndex,
				pageSize: this.pageSize,
				total: this.total
			};
		},
		getPageCount: function() {
			return Math.ceil(this.getTotal() / this.getPageSize());
		},
		render: function() {
			var htmls = this.__render();
			this.el.html(htmls);

			var elList = this.__pelList || [];
			for (var i = 0, len = elList.length; i < len; i++) {
				elList[i].html(htmls);
			}
		},
		renderTo: function(element) {
			element = $(element);
			this.__pelList = this.__pelList || [];
			this.__pelList.push(element);


			var htmls = this.__render();
			element.html(htmls);
		}
	});

})(wejs, jQuery);