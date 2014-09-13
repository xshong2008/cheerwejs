(function($we, $) {
	if (!$we || !$) {
		return;
	}
	/**
	 * 根据传入的form，返回jq对象类型的form
	 *
	 * @param form
	 *            jq选择器，form的DOM对象，jq对象
	 * @returns jq对象的form
	 */
	var getJqForm = function(form) {
		if (!(form instanceof $)) {
			form = $(form);
		}
		return form;
	};

	/**
	 * 获取表单中的所有表单项，目前包括input select textarea
	 *
	 * @param form
	 *            jq的表单对象
	 */
	var getElements = function(form) {
		return form.find('input,select,textarea');
	};

	/**
	 * 获取input元素的值，并填充到data对象中
	 *
	 * @param el
	 *            input元素
	 * @param data
	 *            填充的数据对象
	 */
	var getInputVal = function(el, data) {
		var name = el.name;
		var val = el.value;
		switch (el.type) {
			case 'radio':
				if (el.checked) {
					data[name] = val;
				}
				break;
			case 'checkbox':
				if (el.checked) {
					data[name] = data[name] || [];
					data[name].push(val);
				}
				break;
			default:
				data[name] = val;
				break;
		}

		return data;
	};

	/**
	 * 设置input元素的值
	 *
	 * @param el
	 *            input元素
	 * @param val
	 *            需要设置的值
	 * @param data
	 *            填充表单的数据对象
	 */
	var setInputVal = function(el, val, data) {
		var name = el.name;

		switch (el.type) {
			case 'radio':
				if (el.value == val) {
					el.checked = true;
				}
				break;
			case 'checkbox':
				if ((',' + val + ',').indexOf(',' + el.value + ',') != -1) {
					el.checked = true;
				}
				break;
			default:
				el.value = val;
				break;
		}
	};

	var Form = function() {};

	/**
	 * 获取表单的数据，该API不限于获取form元素的数据值，可以获取任何DOM结构中包裹的表单元素的数据对象
	 *
	 * @param el
	 *            DOM接口，可以是JQuery选择器，可以是jQuery的对象
	 * @param allowEmpty
	 *            返回的对象中，是否允许存在值为空的属性
	 * @returns 当前dom中表单项的录入值
	 */
	Form.getData = function(form, allowEmpty) {
		var data = {};
		allowEmpty = allowEmpty === false ? false : true;
		form = getJqForm(form);

		var els = getElements(form);
		els.each(function() {
			var tagName = this.tagName.toLowerCase();
			var name = this.name;
			var value = this.value;

			if (name && (value || !allowEmpty)) {
				if (tagName == 'input') {
					getInputVal(this, data);
				} else {
					data[name] = value;
				}
			}
		});
		return data;
	};

	/**
	 * 获取表单数据，此处表单为虚拟表单，只要是一个DOM结构即可
	 *
	 * @param form
	 *            表单对象，可以为jquery选择器，可以为dom对象，也可以为jquery对象
	 * @param data
	 *            需要填充到表单的数据
	 * @param cover
	 *            当某个表单项的值不在data中时，是否覆盖
	 */
	Form.setData = function(form, data, cover) {
		form = getJqForm(form);

		var els = getElements(form);
		els.each(function() {
			var tagName = this.tagName.toLowerCase();
			var name = this.name;
			var val = data[name];
			if (name && (cover || val !== undefined)) {
				if (tagName == 'input') {
					setInputVal(this, val||'', data);
				} else {
					this.value = val||'';
				}
			}
		});
	};

	$we.Form = Form;
})(wejs, jQuery);