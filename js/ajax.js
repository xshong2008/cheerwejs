(function($we, $) {
	$we.ajax = function(config) {
		config = $.extend({}, {
			dataType: 'json',
			method: 'POST',
			onComplete: function() {},
			onSuccess: function() {},
			onFail: function(ret) {
				$we.msg.error(ret.msg);
			},
			onError: function() {},
			success: function(ret) {
				if (ret.success) {
					this.onSuccess.call(this.scope || this, ret);
				} else {
					this.onFail.call(this.scope || this, ret);
				}
				this.onComplete.call(this.scope || this, ret);
			},
			error: function(ret) {
				this.onError.call(this.scope || this, ret);
				this.onComplete.call(this.scope || this, ret);
			}
		}, config);


		return $.ajax(config);
	};
})(wejs, jQuery);
