(function($we, $) {
	if (!$we || !$) {
		return;
	}
	var VALIDATE_CLS = {
		"success": "success",
		"error": "error",
		"warring": "warring",
		"info": "info"
	};


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

	var Form = {
		/**
		 * 获取表单的数据，该API不限于获取form元素的数据值，可以获取任何DOM结构中包裹的表单元素的数据对象
		 *
		 * @param el
		 *            DOM接口，可以是JQuery选择器，可以是jQuery的对象
		 * @param allowEmpty
		 *            返回的对象中，是否允许存在值为空的属性
		 * @returns 当前dom中表单项的录入值
		 */
		getData: function(form, allowEmpty) {
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
		},

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
		setData: function(form, data, cover) {
			form = getJqForm(form);

			var els = getElements(form);
			els.each(function() {
				var tagName = this.tagName.toLowerCase();
				var name = this.name;
				var val = data[name];
				if (name && (cover || val !== undefined)) {
					if (tagName == 'input') {
						setInputVal(this, val || '', data);
					} else {
						this.value = val || '';
					}
				}
			});
		},
		/**
		 * 校验表单，并展示校验错误信息
		 * @param  {[type]} form   [description]
		 * @param  {[type]} config [description]
		 * @return {[type]}        [description]
		 */
		validate: function(form, config) {
			form = getJqForm(form);
			var els = getElements(form),
				ret = true;

			els.each(function() {
				ret = Form.validateEl($(this)) && ret;
			});

			return ret;
		},
		/**
		 * 清理表单的校验信息
		 * @param  {[type]} form [description]
		 * @return {[type]}      [description]
		 */
		clearValidate: function(form) {
			form = getJqForm(form);
			var els = getElements(form),
				ret = true;

			els.each(function() {
				Form.hideValidateMsg($(this));
			});
		},
		/**
		 * 校验单个表单元素，并展示错误信息
		 * @param  {[type]} el [description]
		 * @return {[type]}    [description]
		 */
		validateEl: function(el) {
			var rule = el.attr('data-rule');
			var msg = el.attr('data-rule-message');
			var value = el.val();

			if (rule) {
				rule = rule.split(';');
				//循环遍历校验规则
				for (var i = 0, len = rule.length; i < len; i++) {
					var expr = rule[i];
					var validateItem = Verification.run(expr, value);

					if (validateItem.result) {
						Form.hideValidateMsg(el);
					} else {
						msg = Verification.getMessage(validateItem, msg);
						Form.showValidateMsg(el, msg, 'error');
					}
					return validateItem.result;
				}
			}
			return true;
		},
		/**
		 * 展示校验提示信息
		 * @param  {[type]} el  [description]
		 * @param  {string} ret [description]
		 * @return {[type]}     [description]
		 */
		showValidateMsg: function(el, msg, messageType) {
			messageType = messageType;

			var validateCls = VALIDATE_CLS[messageType];

			Form.hideValidateMsg(el);

			//添加错误样式
			el.parent().parent().addClass(validateCls);

			el.tooltip({
				title: msg,
				placement: 'right',
				container: el.parent()
			});

			el.get(0).validateCls = validateCls;
			el.validateCls = validateCls;
			el.tooltip('show');
		},
		/**
		 * 隐藏校验提示信息
		 * @param  {[type]} el [description]
		 * @return {[type]}    [description]
		 */
		hideValidateMsg: function(el) {
			var validateCls = el.get(0).validateCls;
			if (validateCls) {
				el.parent().parent().removeClass(el.get(0).validateCls);
			}
			el.tooltip('destroy');
		},
		/**
		 * 初始化表单的校验
		 * @param  {[type]} form [description]
		 * @return {[type]}      [description]
		 */
		initValidate: function(form) {
			form = getJqForm(form);
			var els = getElements(form);
			els.each(function() {
				var el = $(this);

				//chanage之后，去掉校验信息
				el.on('change', function() {
					Form.hideValidateMsg(el);
				});
			});
		}
	};

	/**
	 * 校验相关
	 * @type {Object}
	 */
	Verification = {
		/**
		 * 添加校验规则
		 * @param {[type]} name   [description]
		 * @param {[type]} config [description]
		 */
		add: function(name, config) {
			if (!name) {
				return;
			}
			name = name.toLowerCase();
			Verification.rules[name] = config;
		},
		/**
		 * 删除校验规则
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		delete: function(name) {
			name = name.toLowerCase();
			delete Verification.rules[name];
		},
		/**
		 * 运行单项校验规则
		 * @param  {string} expr 表达式，例如required,range:1,2
		 * @param  {string} val  控件的value值
		 * @return {object}     通过校验，返回true,否则返回false
		 */
		run: function(expr, val) {
			if (typeof(expr) == 'string') {
				var validateItem = Verification.readExpr(expr),
					validate = validateItem.validate,
					data = validateItem.data || [],
					ret = true;

				if (validate) {
					var checkData = [val].concat(data);
					ret = validate.check.apply(validate, checkData); //执行预定义的校验
				}
				validateItem.result = ret;
				return validateItem;
			}
		},
		/**
		 * 解析表单时为可用对象
		 * @param  {string} expr range:1,100;required;
		 * @return {object}
		 *         name:校验规则名称
		 *         data:配置的校验规则传入的参数
		 *         validate:校验器
		 */
		readExpr: function(expr) {
			expr = expr.split(':');
			var name = expr[0],
				data = expr.length > 1 ? expr[1] : '';

			data = data ? data.split(',') : [];
			name = name.toLowerCase();

			return {
				name: name,
				data: data,
				validate: Verification.rules[name]
			};
		},
		/**
		 * 解析msg的对象
		 * @param  {[type]} msg  [description]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		readMessage: function(msg, name) {
			if (!msg) {
				return null;
			}

			msg = msg.split(';');
			var data = {};

			for (var i = 0, len = msg.length; i < len; i++) {
				var item = msg[i];
				item = item.split(':');
				if (item.length > 1) {
					var key = item[0],
						val = item[1];

					data[key] = val;
				}
			}

			return data[name];
		},
		/**
		 * 获取校验规则的错误消息
		 * @param  {[type]} ret      [description]
		 * @param  {[type]} validate [description]
		 * @param  {[type]} data     [description]
		 * @return {[type]}          [description]
		 */
		getMessage: function(validateItem, msg) {
			if (msg) {
				//解析data-rule-message错误信息
				msg = Verification.readMessage(msg, validateItem.name);
			}

			msg = msg || validateItem.validate.errorMsg;
			msg = [msg].concat(validateItem.data);
			return $we.format.apply($we, msg);
		},
		rules: {
			"required": {
				errorMsg: '不能为空！',
				successMsg: '',
				infoMsg: '不能为空！',
				check: function(val) {
					return !!val;
				},
				message: function(ret) {
					return ret ? '' : this.errorMsg;
				}
			},
			"number": {
				errorMsg: '请填写数字！',
				successMsg: '',
				infoMsg: '请填写数字！',
				check: function(val) {
					return !val || $we.isNumber(val);
				}
			},
			"email": {
				errorMsg: '请填写邮箱！',
				successMsg: '',
				infoMsg: '请填写邮箱！',
				check: function(val) {
					return !val || $we.isEmail(val);
				}
			},
			"money": {
				errorMsg: '请填写金额！',
				successMsg: '',
				infoMsg: '请填写金额！',
				check: function(val) {
					return !val || $we.isMoney(val);
				}
			},
			"mobile": {
				errorMsg: '请填写手机号码！',
				successMsg: '',
				infoMsg: '请填写手机号码！',
				check: function(val) {
					return !val || $we.isMobile(val);
				}
			},
			"int": {
				errorMsg: '请填写整数！',
				successMsg: '',
				infoMsg: '请填写整数！',
				check: function(val) {
					return !val || $we.isInt(val);
				}
			},
			"idno": {
				errorMsg: '请填写正确的身份证号码，15位或18位！',
				successMsg: '',
				infoMsg: '15位或18位！',
				check: function(val) {
					return !val || $we.isIDNo(val);
				}
			},
			"phone": {
				errorMsg: '请填写电话号码！',
				successMsg: '',
				infoMsg: '请填写电话号码！',
				check: function(val) {
					return !val || $we.isPhoneNo(val);
				}
			},
			"post": {
				errorMsg: '请填写电话号码！',
				successMsg: '',
				infoMsg: '请填写电话号码！',
				check: function(val) {
					return !val || $we.isPostNo(val);
				}
			},
			"min": {
				errorMsg: '不能小于{0}！',
				successMsg: '',
				infoMsg: '不能小于{0}！',
				check: function(val, min) {
					if (val === '') {
						return true;
					}
					min -= 0;
					val -= 0;
					return min <= val;
				}
			},
			"max": {
				errorMsg: '不能大于{0}！',
				successMsg: '',
				infoMsg: '不能大于{0}！',
				check: function(val, max) {
					if (val === '') {
						return true;
					}
					max -= 0;
					val -= 0;
					return max >= 0;
				}
			},
			"range": {
				errorMsg: '大小范围在{0}-{1}之内！',
				successMsg: '',
				infoMsg: '大小范围在{0}-{1}之内！',
				check: function(val, min, max) {
					if (val === '') {
						return true;
					}
					val -= 0;
					min -= 0;
					max -= 0;
					return min <= val && max >= val;
				}
			},
			"rangelength": {
				errorMsg: '长度范围在{0}-{1}之内！',
				successMsg: '',
				infoMsg: '长度范围在{0}-{1}之内！',
				check: function(val, min, max) {
					if (!val) {
						return true;
					}
					var valLen = val.length;
					min -= 0;
					max -= 0;
					return min <= valLen && max >= valLen;
				}
			},
			"minlength": {
				errorMsg: '不能小于{0}个字符！',
				successMsg: '',
				infoMsg: '不能小于{0}个字符！',
				check: function(val, min) {
					if (!val) {
						return true;
					}
					var valLen = val.length;
					min -= 0;
					max -= 0;
					return min <= valLen;
				}
			},
			"maxlength": {
				errorMsg: '不能大于{0}个字符！',
				successMsg: '',
				infoMsg: '不能大于{0}个字符！',
				check: function(val, max) {
					if (!val) {
						return true;
					}
					var valLen = val.length;
					min -= 0;
					max -= 0;
					return max >= valLen;
				}
			}
		}
	};

	$we.Verification = Verification;

	$we.Form = Form;
})(wejs, jQuery);
