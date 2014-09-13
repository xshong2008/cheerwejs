(function($we, $) {
	if (!$we || !$) {
		return;
	}
	var getSetFnName = function(name) {
		var fc = name[0];
		upperFc = fc.toUpperCase();
		return ['set', upperFc, name.substr(1)].join('');
	};

	$we.Component = $we.extend($we.Object, {
		el: '',
		cls: '',
		id: '',
		events: [],
		__doInitEvents: function() {
			var events = this.events,
				_this = this;
			for (var i = 0, len = events.length; i < len; i++) {
				var eventConfig = events[i],
					name = eventConfig.event,
					selector = eventConfig.selector,
					fn = eventConfig.handler;

				if (typeof(fn) == 'string') {
					fn = this[fn];
				}
				if (fn && selector) {
					this.el.on(name, selector, {
						handler: fn,
						scope: this,
					}, function(e) {
						var data = e.data;
						data.handler.call(data.scope, e);
					});
				} else {
					this.el.on(e, fn);
				}
			}
		},
		__doDestoryEvents: function() {
			var events = this.events,
				_this = this;
			for (var i = 0, len = events.length; i < len; i++) {
				var eventConfig = events[i],
					name = eventConfig.event,
					selector = eventConfig.selector,
					fn = eventConfig.handler;

				if (typeof(fn) == 'string') {
					fn = this[fn];
				}
				if (selector) {
					this.el.off(name, selector);
				} else {
					this.el.off(e);
				}
			}
		},
		destroy: function() {
			this.__doDestoryEvents();
			this.el.empty();
		},
		initEvents: function() {},
		render: function() {},

		renderTo: function(el) {
			this.el.appendTo(el);
		},
		set: function(data) {
			for (var name in data) {
				var value = data[name],
					setFnName = getSetFnName(name);

				if (this[setFnName]) {
					this[setFnName](value);
				} else if (name !== 'el') {
					this[name] = value;
				}
			}
		},
		doInit: function() {
			if (!this.el) {
				this.el = $('<div></div>');
			} else {
				this.el = $(this.el);
			}
			this.id = (this.id || this.el.attr('id')) || $we.createId();

			this.el
				.attr('id', this.id)
				.addClass(this.cls);

			this.__doInitEvents();
			this.initEvents();

			$we.add(this);
		}
	});

	var extendFn = function(superclazz) {
		return function(extension) {
			var events = [].concat(extension.events || [], superclazz.prototype.events);
			extension.events = events;
			var clazz = $we.extend(superclazz, extension);
			clazz.extend = extendFn(clazz);

			return clazz;
		};
	};

	$we.Component.extend = extendFn($we.Component);
	var insMap = {};
	$we.add = function(comp) {
		insMap[comp.id] = comp;
	};

	$we.get = function(id) {
		return insMap[id];
	};

	var getAttrData = function(type, value) {
		var vv = value;
		try {
			switch (type) {
				case 'function':
					value = eval(value);
					break;
				case 'number':
					value -= 0;
					break;
				case 'object':
					value = eval(value);
					break;
				default:
					value = value;
					break;
			}
			vv = value;
		} catch (e) {

		}
		return vv;
	};

	var getListeners = function(el, events) {
		var attributes = el.attributes,
			listeners = {};

		for (var i = 0, len = events.length; i < len; i++) {
			var eventName = events[i],
				attr = attributes.getNamedItem('on' + eventName);

			if (attr) {
				var attrValue = attr.value;
				listeners[eventName] = {
					fn: getAttrData('function', attrValue)
				};
			}
		}

		return listeners;
	};
	var getAttrs = function(el, attrs) {
		var data = {};
		for (var name in attrs) {
			var attr = null,
				type = attrs[name];

			if (name == 'events') { //事件
				data.listeners = getListeners(el, type);
			} else {
				attr = el.attributes.getNamedItem(name);
				if (attr) {
					var attrValue = attr.value;
					data[name] = getAttrData(type, attrValue);
				}
			}
		}
		return data;
	};

	$we.autoRender = function(selector, Clazz, attrs) {
		$(selector).each(function() {
			var config = getAttrs(this, attrs);
			config.el = $(this);
			config.id = this.id;
			var ins = new Clazz(config);
			ins.render();
			ins.set(config);
		});
	};
})(wejs, jQuery);