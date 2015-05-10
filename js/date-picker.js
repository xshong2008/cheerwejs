(function() {
	var tpl = [
			'<input type="text" class="" value="" name="" data-role="input">',
			'<button class="btn" type="button" data-role="btn">',
			'<i class="icon-calendar"></i>',
			'</button>'
		].join(''),
		DR_INPUT = '[data-role="input"]',
		DR_BTN = '[data-role="btn"]';

	var getDateVal = function(val, format) {
		format = format || 'yyyy-MM-dd';
		if (val && val.indexOf('now') == 0) {
			val = (val.replace('now', '') || '0') - 0;
			val = val * 24 * 3600 * 1000;
			val = (new Date()).getTime() + val;
			val = new Date(val);
			val = $we.Date.format(val, format);
		}
		return val
	};

	$we.DatePicker = $we.Component.extend({
		format: 'yyyy-MM-dd',
		min: '',
		max: '',
		minGear: '', //最小值控件联动：这里是指将当前控件的值，作为minGear指定控件的最小值
		maxGear: '', //最大值控件联动：这里是指将当前控件的值，作为maxGear指定控件的最大值
		name: '',
		placeHolder: '',
		inputSize: 'medium',
		cls: 'input-append',
		events: [{
			event: 'click',
			selector: DR_BTN,
			handler: '_doShowCalendar'
		}],
		_onPicked: function() {
			var val = this.getValue();
			this.fire('change', val);
			if (this.minGear) {
				var minGear = $we.get(this.minGear);
				if (minGear) {
					minGear.setMin(val);
					minGear.showSelector();
				}
			}
			if (this.maxGear) {
				var maxGear = $we.get(this.maxGear);
				if (maxGear) {
					maxGear.setMax(val);
				}
			}
		},
		_doShowCalendar: function() {
			var ipt = this.getInputEl(),
				_this = this,
				config = {
					el: ipt.get(0),
					dateFmt: this.format,
					onpicked: function() {
						_this._onPicked();
					}
				};

			if (this.min) {
				config.minDate = this.min
			}
			if (this.max) {
				config.maxDate = this.max
			}

			WdatePicker(config);
		},
		showSelector: function() {
			this._doShowCalendar();
		},
		setInputSize: function(inputSize) {
			var el = this.getInputEl();
			el.removeClass('input-' + this.inputSize);

			this.inputSize = inputSize;
			if (inputSize) {
				if (isNaN(inputSize)) {
					el.addClass('input-' + this.inputSize);
				} else {
					el.width(inputSize);
				}
			}
		},
		getInputSize: function() {
			return this.inputSize;
		},
		getInputEl: function() {
			return this.el.find(DR_INPUT);
		},
		getName: function() {
			return this.name;
		},
		setName: function(name) {
			this.name = name;
			this.getInputEl().attr('name', this.name);
		},
		setPlaceHolder: function(placeHolder) {
			this.placeHolder = placeHolder;
			this.getInputEl().attr('placeHolder', this.placeHolder);
		},
		getValue: function() {
			return this.getInputEl().val();
		},
		setValue: function(val) {
			val = getDateVal(val, this.format);
			this.getInputEl().val(val);
		},
		setMin: function(min) {
			this.min = getDateVal(min, this.format);
		},
		getMin: function() {
			return this.min;
		},
		setMax: function(max) {
			this.max = getDateVal(max, this.format);
		},
		getMax: function() {
			return this.max;
		},
		render: function() {
			this.el.html(tpl);

			this.set({
				placeHolder: this.placeHolder,
				name: this.name,
				inputSize: this.inputSize
			});
		}
	});

	var selector = '[data-role="wejs-date-picker"]';
	$we.autoRender(selector, $we.DatePicker, {
		min: 'string',
		max: 'string',
		minGear: 'string',
		maxGear: 'string',
		name: 'string',
		placeHolder: 'string',
		value: 'string',
		inputSize: 'string',
		format: 'string',
		events: ['change']
	});
})();
