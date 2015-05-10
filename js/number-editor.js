(function() {
	var DR_NUMBER_INPUT = '[data-role="input"]',
		DR_SUB_BTN = '[data-role="sub-btn"]',
		DR_ADD_BTN = '[data-role="add-btn"]';

	$we.NumberEditor = $we.Component.extend({
		min: null,
		max: null,
		minGear: null,
		maxGear: null,
		cls: 'input-prepend input-append',
		inputSize: 'medium', //mini small medium large xlarge xxlarge
		inputAlign: 'center',
		name: '',
		value: 0,
		events: [{
			event: 'click',
			selector: DR_ADD_BTN,
			handler: '_doAdd'
		}, {
			event: 'click',
			selector: DR_SUB_BTN,
			handler: '_doSub'
		}, {
			event: 'keydown',
			selector: DR_NUMBER_INPUT,
			handler: '_doKeyup'
		}, {
			event: 'change',
			selector: DR_NUMBER_INPUT,
			handler: '_doInputChange'
		}],
		_doChange: function() {
			this.fire('change');
			var val = this.getValue();
			if (this.minGear) {
				$we.get(this.minGear).setMin(val);
			}
			if (this.maxGear) {
				$we.get(this.maxGear).setMax(val);
			}
		},
		_doSub: function() {
			var val = this.getValue(),
				min = this.min;

			val--;
			if (min === null || min <= val) {
				this.setValue(val);
			}

			this._doChange();
		},
		_doAdd: function() {
			var val = this.getValue(),
				max = this.max;

			val++;
			if (max === null || max >= val) {
				this.setValue(val);
			}

			this._doChange();
		},
		_doKeyup: function(e) {
			var keyCode = e.keyCode;
			if ((48 <= keyCode && keyCode <= 57) || keyCode == 190 || keyCode == 18) {

			} else {
				e.preventDefault();
			}
		},
		_doInputChange: function(e) {
			var val = this.getInputEl().val(),
				min = this.min,
				max = this.max;

			val -= 0;

			if (min !== null && val < min) {
				val = min;
			} else if (max !== null && val > max) {
				val = max;
			}
			this.getInputEl().val(val);
			this._doChange();
		},
		setMin: function(min) {
			this.min = min;
		},
		getMin: function() {
			return this.min;
		},
		setMax: function(max) {
			this.max = max;
		},
		getMax: function() {
			return this.max;
		},
		setInputSize: function(inputSize) {
			var el = this.getInputEl();
			el.removeClass('input-' + this.inputSize);

			this.inputSize = inputSize;
			if (inputSize) {
				el.addClass('input-' + this.inputSize);
			}
		},
		getInputSize: function() {
			return this.inputSize;
		},
		setName: function(name) {
			this.name = name;
			this.getInputEl().attr('name', name);
		},
		getName: function() {
			return this.name;
		},
		getInputEl: function() {
			return this.el.find(DR_NUMBER_INPUT);
		},
		setValue: function(val) {
			if (!isNaN(val)) {
				this.getInputEl().val(val);
			}
		},
		getValue: function() {
			return this.getInputEl().val() - 0;
		},
		setInputAlign: function(align) {
			this.align = align;
			this.getInputEl().css('text-align', align);
		},
		getInputAlign: function() {
			return this.inputAlign;
		},
		render: function() {
			var el = this.el,
				htmls = [
					'<button class="btn" type="button" data-role="sub-btn">-</button>',
					'<input type="text" class="" value="" name="" data-role="input">',
					'<button class="btn" type="button" data-role="add-btn">+</button>'
				];

			el.html(htmls.join(''));


			this.set({
				value: this.value,
				inputAlign: this.inputAlign,
				inputSize: this.inputSize
			});
		}
	});

	var selector = '[data-role="wejs-number-editor"]';
	$we.autoRender(selector, $we.NumberEditor, {
		name: 'string',
		inputSize: 'string',
		min: 'number',
		value: 'string',
		minGear: 'string',
		maxGear: 'string',
		events: ['change']
	});
})();
