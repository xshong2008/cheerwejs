/*******core**********/
(function(){

	/**
	*定义命名空间
	*/
	var $we={
		version:'1.0.0',
		backCompat:document.compatMode=='BackCompat'?true:false
	};
	

	/****************定义基础方法********************************/

	/**
	*@description 覆盖多个object的方法,scope将作为保留关键字,用于传递作用域
	*@param o:目标对象
	*@param c:源对象，注意：源对象可以为多个,分多个参数传递
	*/
	$we.apply=function(o,c){
		if(!o||!c||typeof(c)!='object'){
			return;
		}
		
		for(var p in c){
			o[p]=c[p];
		}
		
		for(var i=2;i<arguments.length;i++){
			arguments.callee(o,arguments[i]);
		}
		return o;
	};
	
	/**
	*@desc 将object对象，转换成字符串，排除function
	*@param obj 许愿转换成字符串的对象
	*/
	var toJsonStr=function(obj){
		if(obj===undefined){
			return 'undefined';
		}
		if(obj===null){
			return 'null';
		}
		var _str=[];
		switch(typeof(obj)){
			case 'object':
				if(obj instanceof Array){
					_str.push('[');
					for(var i=0,len=obj.length;i<len;i++){
						_str.push(toJsonStr(obj[i]));
						_str.push(',');
					}
					if(_str.length>1){
						_str.pop();
					}
					_str.push(']');
				}else{
					_str.push('{')
					for(var o in obj){
						if(o!=undefined){					
							_str.push('"'+o+'":');
							_str.push(toJsonStr(obj[o]));
							_str.push(',');
						}
					}
					if(_str.length>1){
						_str.pop();
					}
					_str.push('}');
				}
				break;
			case 'string':
				_str.push('"');
				_str.push(obj.replace(/"/g,'\"'));
				_str.push('"');
				break;
			case 'number':
				_str.push(obj);
				break;
			case 'boolean':
				_str.push('"');
				_str.push(obj);
				_str.push('"');
				break;
			case 'funciton':
				break;
			default:
				_str.push('"');
				_str.push(obj);
				_str.push('"');
				break;
		}
		return _str.join('');
	};
	$we.apply($we,{
		/**@desc 转换成JSON字符串
		*/
		toJson:function(obj){
			return toJsonStr(obj);
		},
		/**@desc 将JSON字符串转换成对象
		*/
		parseJson:function(str){
			try{
				var json=eval('('+str+')');
				return json;
			}catch(e){
				return null;
			}
		}
	});
	
	/**
	*@desc 对象克隆
	*@param obj 需要克隆的目标对象
	*@return 克隆后的对象
	*/
	$we.clone=function(obj){
		var tar;
		switch(typeof(obj)){
			case 'object':
				if(obj instanceof Array){
					tar=[];
					for(var i=0,len=obj.length;i<len;i++){
						tar[i]=$we.clone(obj[i]);
					}
				}else{
					if(!obj){
						return obj;
					}else{
						tar={};
						for(var o in obj){
							tar[o]=$we.clone(obj[o]);
						}
					}
				}
				break;
			default:
				tar=obj;
				break;
		}
		return tar;
	};
	
	
	/**
	*@desc 类实例化时，遍历对象的所有属性，将对象类型的属性数据重新克隆一份，防止地址重用的问题
	*/
	var cloneObjProperties=function(obj){
		for(var o in obj){
			if(typeof(obj[o])=='object'&&o!='superclass'&&o!='scope'){
				obj[o]=$we.clone(obj[o]);
			}
		}
		return obj;
	};
	
	
	/**
	*@desc 类继承
	*@param superclass 父类
	*@param exconfig 需要扩展到属性
	*@return 新的类
	*/
	$we.extend=function(superclass,extend){
		if(arguments.length==1){
			extend=superclass;
			superclass=null;
		}
		var clazz=function(config){
			//克隆对象，防止地址公用
			cloneObjProperties(this);
			$we.apply(this,config);
			this.init=this.init||function(){};
			this.init(config);
		};
		if(!arguments.length){
			return clazz;
		}		
		var cp=clazz.prototype;	
		
		if(superclass){
			var sp=superclass.prototype;
			
			var f=function(){};
			f.prototype=sp;
			
			cp=new f();
			cp.constructor=clazz;
			clazz.superclass=sp;
			clazz.prototype.superclass=sp;
		}
		if(extend){
			$we.apply(cp,extend);
		}

		$we.apply(clazz.prototype,cp);
		
		return clazz;
	};
	
	$we.apply($we,{
		/**@desc 清除选择
		*/
		clearSelection:function(){
			window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
		},
		
		/**@desc console日志
		*@param msg 消息
		*/
		log:function(msg){
			if(window['console']){
				console.log(msg);
			}
		},
		
		/**@description 合并多个object的方法,本方法只将o中不存在（即值为undefined）的属性,将c中对应的属性进行覆盖
		*@param o: 目标对象
		*@param c:源对象，注意：源对象可以为多个，分多个参数传递
		*@return null
		*/
		applyIf:function(o,c){
			if(!o||!c||typeof(c)!='object'){
				return;
			}	
			for(var p in c){
				if(o[p]==undefined){
					o[p]=c[p];
				}			
			}		
			for(var i=2;i<arguments.length;i++){
				arguments.callee(o,arguments[i]);
			}	
			return o;
		},
		
		
		/**@desc 命名空间定义函数
		*/
		ns:function(){
			var a=arguments, o=null, i, j, d, rt;
			for (i=0; i<a.length; ++i) {
				d=a[i].split(".");
				rt = d[0];
				eval('if (typeof ' + rt + ' == "undefined"){' + rt + ' = {};} o = ' + rt + ';');
				for (j=1; j<d.length; ++j) {
					o[d[j]]=o[d[j]] || {};
					o=o[d[j]];
				}
			}
		},
		
		/**@desc 类重写
		*param ac
		*/
		override:function(ac,overrides,cover){
			var p=ac.prototype;
			// var __attrs=ac.__attrs?ac.__attrs.split(','):[];
			// var __fns=ac.__fns?ac.__fns:{};
			// var __attrsMap=ac.__attrsMap?ac.__attrsMap:{};
			cover=cover===false?false:true;
			for(var o in overrides){
				if(!p[o]||cover){
					var att=overrides[o];
					// if(typeof(att)!='function'){
						// __attrs.push(o);
						// __attrsMap[o.toLowerCase()]=o;
					// }else{
						// __fns[o.toLowerCase()]=o;
					// }
					p[o]=overrides[o];
				}
			}
			// ac.__attrs=__attrs.join(',');
			// ac.__fns=__fns;
			// ac.__attrsMap=__attrsMap;
		},
		
		/**@desc 生成ID
		*/
		createId:function(prix,length){
			prix=prix||'';
			prix+=(prix.substr(0,2)=='x_')?'':'x_';
			prix+=(prix.substr(prix.length-1,1)=='_')?'':'_';
			
			length=length||5;
			var _x=Math.random()*Math.pow(10, length)+'';
			return prix+_x.substr(0,_x.indexOf('.'));
		},
		
		/**@desc 格式化，同C#的format
		*@return 第一个参数是格式化的字符串，第二个参数是参数
		*/
		format : function(format){
			var args = Array.prototype.slice.call(arguments, 1);
			if(format.length&&format instanceof Array){
				format=$we.join(format)
			}
			return format.replace(/\{(\d+)\}/g, function(m, i){
				return args[i];
			});
		},
		
		/**@desc 格式化
		*@param p: <input id="{id}" name="{name}" class="{cls}"/>
		*@param d:{
			id:'a_email',
			name:'email',
			class:'mui-email'
		}
		*@return <input id="a_email" name="email" class="mui-email"/>
		*/
		parse:function(p,d){
			var reg;
			if(typeof(p)=='object'&&p instanceof Array){
				p=$we.join(p);
			}
			for(var i in d){
				reg=new RegExp('{'+i+'}','g');
				
				p=p.replace(reg,d[i]);
			}
			return p;
		},
			
		/**@desc 获取浏览器信息
		*@return 浏览器信息
		*/
		getNavInfo:function(){
			
			var ua = navigator.userAgent.toLowerCase(),
			check = function(r){
				return r.test(ua);
			},
			navInfo={};
			
			navInfo.isStrict = document.compatMode == "CSS1Compat";
			navInfo.isOpera = check(/opera/);
			navInfo.isChrome = check(/chrome/);
			navInfo.isWebKit = check(/webkit/);
			navInfo.isSafari = !navInfo.isChrome && check(/safari/);
			navInfo.isSafari2 = navInfo.isSafari && check(/applewebkit\/4/); // unique to Safari 2
			navInfo.isSafari3 = navInfo.isSafari && check(/version\/3/);
			navInfo.isSafari4 = navInfo.isSafari && check(/version\/4/);
			navInfo.isIE = !navInfo.isOpera && check(/msie/);
			navInfo.isIE7 = navInfo.isIE && check(/msie 7/);
			navInfo.isIE8 = navInfo.isIE && check(/msie 8/);
			navInfo.isIE6 = navInfo.isIE && !navInfo.isIE7 && !navInfo.isIE8;
			navInfo.isGecko = !navInfo.isWebKit && check(/gecko/);
			navInfo.isGecko2 = navInfo.isGecko && check(/rv:1\.8/);
			navInfo.isGecko3 = navInfo.isGecko && check(/rv:1\.9/);
			navInfo.isBorderBox = navInfo.isIE && !navInfo.isStrict;
			navInfo.isWindows = check(/windows|win32/);
			navInfo.isMac = check(/macintosh|mac os x/);
			navInfo.isAir = check(/adobeair/);
			navInfo.isLinux = check(/linux/);
			navInfo.isSecure = /^https/i.test(window.location.protocol);
			return navInfo;
		},
		
		/**@desc 获取页面内容尺寸*/
		getContentSize:function(doc){
			doc=doc||document;
			var body=doc.body;
			return {
				height:body.scrollHeight,
				width:body.scrollWidth
			}
		},
		
		/**@desc 获取页面尺寸*/
		getPageSize:function(win){
			win=win||window;
			var doc=win.document;
			if(win.innerHeight){
				return {
					width:win.innerWidth,
					height:win.innerHeight
				}
			}else if(doc.documentElement&&doc.documentElement.clientHeight){
				return {
					width:doc.documentElement.clientWidth,
					height:doc.documentElement.clientHeight
				}
			}else{
				return {
					width:doc.body.offsetWidth,
					height:doc.body.offsetHeight
				}
			}
		},
		/**@desc 包含，字符串包含判断*/
		contains:function(s,v,split){
			split=split===undefined?',':'';
			s=split+s+split;
			v=split+v+split;
			
			return s.indexOf(v)==-1?false:true;
		},		
		/**
		 * 首尾去空格
		 * @param str 需要去除空格的字符串
		 */
		trim: function(str) {
			return str.replace(/(^\s*)|(\s*$)/g, "");
		},
		/**
		 * 左去空格
		 * @param str 需要去除空格的字符串
		 */
		leftTrim: function(str) {
			return str.replace(/(^\s*)/g, "");
		},
		/**
		 * 右去空格
		 * @param str 需要去除空格的字符串
		 */
		rightTrim: function(str) {
			return str.replace(/(\s*$)/g, "");
		},
		/**
		 * 是否是数组
		 */
		isArray: function(value) {
			return Object.prototype.toString.apply(value) === '[object Array]';
		},
		/**
		 * 判断是否为数字
		 */
		isNumber: function(str) {
			return !isNaN(str);
		},
		/**
		 * 邮箱
		 */
		isEmail: function(str) {
			return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(str);
		},
		/**
		 * 电话号码
		 */
		isPhoneNo: function(str) {
			return /\d{3}-\d{8}|\d{4}-\d{7}/.test(str);
		},
		/**
		 * 邮编
		 */
		isPostNo: function(str) {
			return /[1-9]\d{5}(?!\d)/.test(str);
		},
		/**
		 * 身份证号码
		 */
		isIDNo: function(str) {
			return /\d{15}|\d{18}/.test(str);
		},
		/**
		 * 整数
		 */
		isInt: function(str) {
			return /^-?[1-9]\d*$/.test(str);
		},
		/**
		 * 正整数
		 */
		isPosInt: function(str) {
			return /^[1-9]\d*$/.test(str);
		},
		/**
		 * 负整数
		 */
		isNegInt: function(str) {
			return /^-[1-9]\d*$/.test(str);
		},
		/**
		 * 是否是手机号码
		 */
		isMobileNo: function(str) {
			return /^1[3|4|5|7|8][0-9]\d{4,8}$ /.test(str);
		},
		/**
		 * 金额，2位有效数字
		 */
		isMoney: function(str) {
			return /^(-)?(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/.test(str);
		},
		/**
		 * 正金额，2位有效数字
		 */
		isPosMoney: function(str) {
			return /^(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/.test(str);
		},
		/**
		 * 负金额，2位有效数字
		 */
		isNegMoney: function(str) {
			return /^(-)(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/.test(str);
		}
	});
	
	$we.na=$we.getNavInfo();

	/**@desc 判断浏览器是否使用的是IE的盒子模型
	*/
	$we.ieBox=$we.na.isIE&&$we.backCompat;
	
	/**************WeJS对象管理******************************/
	var __instance={};
	$we.apply($we,{
		instance:{},
		add:function(ins){
			if(!ins){
				return;
			}
			ins.id=ins.id||$we.createId();
			__instance[ins.id]=ins;
		},
		get:function(id){
			return __instance[id];
		},
		remove:function(ins){
			if(!ins){
				return;
			}
			$we.destory(ins);
			if(typeof(ins)=='object'){
				ins=ins.___weId||ins.id;
			}
			delete __instance[ins.id];
		},
		destory:function(ins){
			if(ins){
				return;
			}
			if(typeof ins.destory=='function'){
				ins.destory();
			}
			if(typeof ins.removeAllListeners=='function'){
				ins.removeAllListeners();
			}
			var es=ins._events;
			for(var e in es){
				delete es[e];
			}
			for(var c in ins){
				delete ins[c];
			}
		}
	});

	/***@desc WeJS基础类，提供事件的监听、触发事件、移除事件监听等基础方法
	*/
	$we.Object=$we.extend({
		_events:{},
		/**@desc 事件监听器，如果子类和父类都配置了该属性，父类的事件监听器将会无效，建议该配置在不可继承的子类或者实例化中使用*/
		listeners:{},
		/**@desc 触发事件
		*@param e 事件名称
		*@param data 触发事件所传递的默认事件参数
		*@return undefined
		*/
		fireEvent:function(e,data){
			if(!arguments.length){
				return;
			}
			var event=this._events[e];
			if(!event){
				return;
			}else{
				for(var i=0,len=event.handler.length;i<len;i++){
					var h=event.handler[i];
					try{
						h.fn.call(h.scope||this,{
							e:e,
							eventData:data,
							data:h.data
						});
					}catch(e){
					
					}
				}
			}
		},
		
		/**@desc 添加事件监听
		*@param e 事件名称
		*@param fn 处理事件的回调方法
		*@param sc 处理事件的回调方法的作用域，默认为this
		*@param data 添加事件监听是传递的处理参数
		*@return undefined
		*/
		addEventListener:function(e,fn,sc,data){
			if(arguments.length<2){
				return;
			}
			this._events[e]=this._events[e]||{
				name:e,
				handler:[]
			}
			this._events[e].handler.push({
				fn:fn,
				data:data,
				scope:sc
			});
		},
		
		/**@desc 移除事件监听，该方法至少需要传递一个参数，
			   传递一个参数是，将会移除当前事件名称下的所有监听，两个参数都传递的时候会针对当前处理方法进行事件监听的移除
		*@param e 事件名称
		*@param fn 处理事件的回调方法
		*@return undefined
		*/
		removeEventListener:function(e,fn){
			if(!arguments.length){
				return;
			}
			if(!fn){
				if(this._events[e]){
					delete this._events[e];
				}
			}else{
				if(this._events[e]){
					var h=this._events[e].handler;
					for(var i=0,len=h.length;i<len;i++){
						if(h[i]==fn){
							h.splice(i,1);
						}
					}
					//this._events[e].handler.remove(fn);
				}
			}
		},
		/**@desc 移除所有的事件监听器
		*/
		removeAllEventListener:function(){
			var es=this._events;
			for(var e in es){
				this.removeEventListener(e);
			}
		},
		/**@desc fireEvent方法的简写
		*/
		fire:function(){
			this.fireEvent.apply(this,arguments);
		},
		/**@desc addEventListener方法的简写
		*/
		on:function(){		
			this.addEventListener.apply(this,arguments);
		},
		/**@desc removeEventListener方法的简写
		*/
		un:function(){
			this.addEventListener.apply(this,arguments);
		},
		/**@desc 初始化Listeners
		*/
		initListener:function(listeners){
			if(listeners){
				for(var l in listeners){
					var li=listeners[l];
					this.addEventListener(l,li.fn,li.scope,li.data)
				}
			}
		},
		/**@desc 销毁
		*/
		destory:function(){
			this.dieEvent();
			for(var t in this){
				this[t]=null;
			}
		},
		/**@desc 所有类统一的调用入口
		*/
		doInit:function(){},
		/**@desc 所有类的统一初始化入口，用于个性化的设置
		*/
		init:function(config){
			if(!this.id){//ID是必须的
				this.id=$we.createId();
			}
			$we.add(this);
			this._events={};
			this.initListener(this.listeners);
			this.doInit(config);
			this.fire('afterinit');
			// this.initEvent();
		}
	});

	/**@desc 日期相关操作的封装
	*/	
	$we.date = {
		parse:function(str){
			var date=null;
			try{
				date=new Date(str);
			}catch(e){
				date=null;
			}
			return date;
		},
		format : function (date,format) {
			if(!date){
				return '';
			}
			if(typeof(date)=='string'){
				date=new Date(date);
			}else if(typeof(date) =='object'){
				if(!(date instanceof Date)){
					return '';
				}
			}
			format=format||'yyyy-MM-dd HH:mm:ss';
			var o = {
				"M+" : date.getMonth() + 1, //month
				"d+" : date.getDate(), //day
				"h+" : date.getHours(), //hour
				"H+" : date.getHours(), //hour
				"m+" : date.getMinutes(), //minute
				"s+" : date.getSeconds(), //second
				"q+" : Math.floor((date.getMonth() + 3) / 3), //quarter
				"S" : date.getMilliseconds() //millisecond
			}
			
			if (/(y+)/.test(format)) {
				format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
			}
			
			for (var k in o) {
				if (new RegExp("(" + k + ")").test(format)) {
					format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
				}
			}
			return format;
		},
		getToday:function(){
			return $we.date.format(new Date(),'yyyy-MM-dd');
		},
		getCurrent:function(){
			return $we.date.format(new Date(),'HH:mm:ss');
		},
		getNow:function(){
			return $we.date.format(new Date(),'yyyy-MM-dd HH:mm:ss');
		}
	};
	
	/**@desc HTML编码相关封装*/
	$we.apply($we,{
		htmlEncode:function(str) {
			 var s = "";
			 if (str.length == 0) return "";
			 s = str.replace(/&/g, "&amp;");
			 s = s.replace(/</g, "&lt;");
			 s = s.replace(/>/g, "&gt;");  
			 s = s.replace(/\'/g, "&#39;");
			 s = s.replace(/\"/g, "&quot;");
			 return s;
		},
		htmlDecode:function(str){   
			var s = "";   
			if (str.length == 0) return "";
			s = str.replace(/&amp;/g, "&");
			s = s.replace(/&lt;/g, "<");
			s = s.replace(/&gt;/g, ">"); 
			s = s.replace(/&#39;/g, "\'");   
			s = s.replace(/&quot;/g, "\""); 
			return s;   
		} 
	});

	
	/**************WeJS全局声明******************************/
	window['wejs']=window['$we']=$we;
})();

