(function($we, $) {
	if (!$we || !$) {
		return;
	}

	$we.ns('wejs.msg');

	var msgId = '__wejs_msg',
		statusCls = {
			'info': 'alert-info',
			'success': 'alert-success',
			'warning': 'alert-block',
			'error': 'alert-error'
		},
		getMsgEl = function() {
			var el = $('#' + msgId);
			if (!el.length) {
				el = $('<div id="' + msgId + '"></div>');
				el.appendTo(document.body);
			}
			el.get(0).className = 'alert';
			return el;
		};

	$we.apply($we.msg, {
		show: function(msg, status) {
			var el = getMsgEl();
			el.addClass(statusCls[status]);
			el.html(msg).show().css({
				'z-index': 100000,
				'position': 'fixed',
			});

			var ps = $we.getPageSize();
			var left = (ps.width - el.width()) / 2;
			el.css({
				'top': -50,
				'left': left
			});
			el.animate({
				'top': 50
			});

			setTimeout(function() {
				$we.msg.hide();
			}, 3000);

			return el;
		},
		hide: function() {
			getMsgEl().animate({
				top: -50
			});
		},
		info: function(msg) {
			this.show(msg, 'info');
		},
		success: function(msg) {
			this.show(msg, 'success');
		},
		warning: function(msg) {
			this.show(msg, 'warning');
		},
		error: function(msg) {
			this.show(msg, 'error');
		}
	});

	$we.Msg = $we.msg;
})(wejs, jQuery);
