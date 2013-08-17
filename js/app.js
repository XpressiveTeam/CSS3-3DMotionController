App = Ember.Application.create();

App.Router.map(function() {
});

App.timingFunctionValues = Ember.Object.create({
	content:['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out']
});

App.IndexRoute = Ember.Route.extend({
	model: function(){
		var values = loadValues();
		values.forEach(function(item, index){
			item.active = index == 0;
		});
		window.localStorage.setItem('values', JSON.stringify(values));
		return values;
	}
});

App.IndexController = Ember.ArrayController.extend({
	playState:false,
	duration: function(key, value){
		if (arguments.length === 1) { // get
			return loadAnimationSetting().duration;
		}else{
			
		}
	}.property('duration'),
	timingFunction: function(key, value){
		if (arguments.length === 1) { // get
			var setting = loadAnimationSetting();
			return setting.timingFunction;
		}else{
		}
	}.property('timingFunction'),
	updateAnimationSetting: function(){
		console.log('set setting');
		var settingValue = getAnimationValue();
		window.localStorage.setItem('animationSetting', JSON.stringify(settingValue));
		this.stop();
		this.play();
	},
	newItem: function(){
		console.log('new');
		var values = loadValues();
		var value = getInitialHandleValues();//getHandleValues();
		value.valueId = generateId();
		value.active = true;
		var maxOrder = 0;
		values.forEach(function(item, index) {
			item.active = false;
			maxOrder = Math.max(item.order, maxOrder);
		});
		value.order = maxOrder + 1;
		values.push(value);
		console.log(values);
		window.localStorage.setItem('values', JSON.stringify(values));
		this.set('content', values);
	},
	updateItem: function(){
		console.log('update');

		var item = getHandleValues();
		var values = loadValues();
		var selected = values.findProperty('active', true);
		if( selected != null ){
			selected.x = item.x;
			selected.y = item.y;
			selected.z = item.z;
			selected.rx = item.rx;
			selected.rz = item.rz;
			selected.s = item.s;
			selected.p = item.p;
	
			window.localStorage.setItem('values', JSON.stringify(values));
			this.set('content', values);
		}
	},
	copy: function(){
		console.log('copy');
		var values = loadValues();
		var selected = values.findProperty('active', true);
		
		if( selected != null ){
		
			var copied = clone(selected);
			copied.valueId = generateId();
			copied.order += 1;
			copied.active = true;
			values.forEach(function(value, index) {
				value.active = false;
				if(value.order >= copied.order){
					value.order++;
				}
			});
			values.push(copied);
			values.sort(function(a, b) {
				return ( a.order > b.order ? 1 : -1);
			});
			window.localStorage.setItem('values', JSON.stringify(values));
			this.set('content', values);
		}else{
			this.newItem();
		}
	},
	deleteItem: function(item){
		console.log('delete');
		var values = loadValues();
		var removeTarget = values.findProperty('valueId', item.valueId);
		values.removeObject(removeTarget);
		window.localStorage.setItem('values', JSON.stringify(values));
		this.set('content', values);
	},
	applyItem: function(item){
		console.log('apply');
		this.stop();

		var values = loadValues();
		values.forEach(function(value, index) {
			if(value.valueId == item.valueId){
				value.active = true;
			}else{
				value.active = false;
			}
		});
		window.localStorage.setItem('values', JSON.stringify(values));
		this.set('content', values);
		setHandleValue(item);
	},
	reset: function(){
		this.stop();
		resetHandleValue();
	},
	updateSortOrder: function(indexes){
		console.log(indexes);
		var values = loadValues();
		values.forEach(function(item) {
			var index = indexes[item.valueId];
			item.order = index;
		}, this);
		values.sort(function(a,b){
			var aOrder = a["order"];
			var bOrder = b["order"];
			if( aOrder < bOrder ) return -1;
			if( aOrder > bOrder ) return 1;
    			return 0;
		});
		window.localStorage.setItem('values', JSON.stringify(values));
		this.set('content', values);		
	},
	play: function(){
		console.log('play');

		var state = !this.get('playState');
		this.set('playState', state);
		
		if(state){
		
			$('#outline').css(vendarPrefix + 'animation-play-state', 'running');
		
			var values = loadValues();
			var keyframesCSS = generateKeyframesCSSOfValues(values);
			//console.log(keyframesCSS);
		
			var option = getAnimationValue();
		
			var animationCSS = generateAnimationCSS(option);
		
			$('#animationStyle').remove();
		
			var styleBody = keyframesCSS + animationCSS;
		
			var styleTag = substitute(StyleTagTemplate, [styleBody]);
			var timer = $.timer(function(){
				$(styleTag).appendTo('head');
			});
			timer.once(1);
		$('#xController,#yController,#zController, #perspectiveController, #rotationController, #scaleController, #translate').hide();
		}else{
			this.reset();
			var values = loadValues();
			var selected = values.findProperty('active', true);
			if(selected != null){
				this.applyItem(selected);
			}

		$('#xController,#yController,#zController, #perspectiveController, #rotationController, #scaleController, #translate').show();
		}
	},
	stop: function() {
		$('#animationStyle').remove();
		this.set('playState', false);
		$('#xController,#yController,#zController, #perspectiveController, #rotationController, #scaleController, #translate').show();
	},
	pause: function(){
		if($('#outline').css(vendarPrefix + 'animation-play-state') == "paused"){
			console.log('resume');
			$('#pauseButton').attr("checked", false);
			$('#outline').css(vendarPrefix + 'animation-play-state', 'running');
		}else{
			console.log('stop');
			$('#pauseButton').attr("checked", true);
			$('#outline').css(vendarPrefix + 'animation-play-state', 'paused');
		}
		console.log($('#outline').css(vendarPrefix + 'transform'));
	},
	export: function(){
		console.log('show export');
		
		var exportData = {
			values:loadValues(),
			setting:loadAnimationSetting()
		}
		var exportDataJSON = JSON.stringify(exportData);
		App.ExportController.set('content', exportDataJSON);
		$('#exportDialog').dialog('open');
	},
	import: function(){
		console.log('show import');
		
		$('#importDialog').dialog('open');
		/*
		var importData = prompt('Import Data');
		if( importData == null || importData == "" ){
			return;
		}
		
		try{
			var datas = JSON.parse(importData);
			window.localStorage.setItem('values', importData);
			this.set('content', datas);
		}catch(e){
			alert('Import Data is not Valid.');
		}
		*/
	},
	clear: function(){
		console.log('clear');
		window.localStorage.clear();
		this.set('content', loadValues());
	},
	cleardb: function(){
		window.localStorage.clear();
		window.location.reload();
	}
	
});

App.IndexView = Ember.View.extend({
	didInsertElement: function(){
		var controller = this.get('controller');
		$('.sortable').sortable({
			axis: 'y',
			connectWith: '.sortable',
			update: function(event, ui) {
				console.log("sort update");
				var indexes = {};

				$(this).find('.item').each(function(index) {
					indexes[$(this).data('id')] = index;
				});

				$(this).sortable('cancel');

				controller.updateSortOrder(indexes);
			}
		});
		resetHandleValue();
		controller.play();
	},
	drag: function(e){
		var controller = this.get('controller');
		controller.updateItem();
	},
	change: function(e){
		console.log(e);
		var controller = this.get('controller');
		if( $(e.target).attr('type') == 'text' ){
			controller.updateItem();
		}else if( $(e.target).attr('id') == 'duration' || $(e.target).attr('id') == 'timingFunction' ){
			controller.updateAnimationSetting();
		}
	},
	/*
	eventManager: Ember.Object.create({
		mouseUp: function(e, view) {
			console.log(e.target);
			if( $(e.target).hasClass('controllers') ){
				controller.updateItem();
			}
		}
	}),
	*/
	layout: Ember.Handlebars.compile(
			'<div id="perspectiveController" class="controllers ui-draggable" style="right: 50px;  ">' +
			'	P' +
			'	<input id="pText" type="text" size="6" />' +
			'</div>'+
			'<div id="scaleController" class="controllers ui-draggable" style="right: 110px; ">' +
			'	S' +
			'	<input id="sText" type="text" size="6" />' +
			'</div>'+
			'<div id="rotationController" class="controllers ui-draggable" >' +
			'	R' +
			'	<input id="rText" type="text" size="15" />' +
			'</div>'+
			'<div id="xController" class="controllers ui-draggable" style="bottom: 40px; ">' +
			'	+' +
			'	<input id="xText" type="text" size="15" />' +
			'</div>'+
			/*
			'<div id="yController" class="controllers ui-draggable" style="right: 260px;  ">' +
			'	Y' +
			'	<input id="yText" type="text" size="6" />' +
			'</div>'+
			*/
			'<div id="zController" class="controllers ui-draggable" style="right: 180px;  ">' +
			'	Z' +
			'	<input id="zText" type="text" size="6" />' +
			'</div>'+
			
			'<div id="historyController" class="controller-background">'+
			'	<div id="historyOption">'+
			'		<span class="panel-title" >CSS3 3D Motion Controller</span>'+
			'	</div>'+	
			'	<div id="historyToolBar" class="toolBar">'+
			
			/*'		<button id="newbutton" {{action "newItem"}}>+</button>'+*/
			
			'		<button id="copybutton" {{action "copy"}}>+</button>'+
			'		<button id="playbutton" {{action "play"}} class="checkButtonLabel right" for="playButton" >'+
			'			{{#if playState}}'+
			'				Stop'+
			'			{{else}}'+
			'				Play'+
			'			{{/if}}'+
			'		</button>'+			
			'	</div>'+
			'	<ul id="historyList" class="sortable">'+
			'		{{#each value in model}}'+
			'		<li {{bindAttr class=":item value.active:active" data-id="value.valueId"}}  {{action "applyItem" value}}>'+
			'			t:({{value.x}},{{value.y}},{{value.z}}) r:({{value.rx}}, {{value.rz}}) s:{{value.s}}'+
			'			<button class="flatButton" {{action "deleteItem" value}}>×</button>'+
			'		</li>'+
			'		{{/each}}'+
			'	</ul>'+

			'	<div class ="animationSetting">'+
			'		Translate:'+
			'		<input id="easymode" type="radio" name="mode" value="0" checked><label for="easymode">Easy</label>'+
			'		<input id="advancedmode" type="radio" name="mode" value="1"><label for="advancedmode">Advance</label>'+
			'	</div>'+
			'	<div class="animationSetting">'+
			'		Running Time:'+
			'		<input id="duration" type="number" min="1" {{bindAttr value="duration"}}> sec'+
			'	</div>'+
			'	<div class="animationSetting">'+
			'		Easing Mode:'+
			'		{{view Ember.Select id="timingFunction" contentBinding="App.timingFunctionValues.content" valueBinding="timingFunction"}}'+
			'	</div>'+
			'	<div class ="animationSetting globalsetcontroller">'+
			'		<button id="initbutton" class="" {{action "cleardb"}}>Reset</button>'+
			'		<button id="exportbutton" {{action "export"}}>Export</button>'+
			'	</div>'+
			'</div>'+
			'	<textarea id="translate">' +
			'		perspective(5000px) translate3d(0px,0px,0px) rotateX(0deg) rotateZ(0deg) scale3d(1,1,1)' +
			'	</textarea>'+
			'{{view App.ExportView}}'
	
	)
});

App.ModalView = Ember.View.extend({
});

App.ExportController = Ember.Controller.create({
	content: ''
});

App.ExportView = App.ModalView.extend({
	didInsertElement: function(){
		$('#exportDialog').dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				"OK": function(){
					$(this).dialog('close');
				}
			}
		});
	},
	templateName: 'export',
	layout:Ember.Handlebars.compile(
		'<div id="exportDialog" class="ui-dialog controller-background" role="dialog">'+
		'	<div class="ui-dialog-titlebar">'+
		'		<span class="ui-dialog-title">Export</span>'+
		'	</div>'+
		'	<div class="ui-dialog-content">'+
		'		<span class="panel-title">Export</span>{{view Ember.TextArea valueBinding="App.ExportController.content" rows="12" cols="70"}}'+
		'	</div>'+
		'</div>'
	)

});

App.ImportView = App.ModalView.extend({
	didInsertElement: function(){
		$('#importDialog').dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				"OK": function(){
					$(this).dialog('close');
				}
			}
		});
	},
	close: function(e){
		//TODO: よばれない？
		console.log('aaa');
	},
	templateName: 'import',
	layout:Ember.Handlebars.compile(
		'<div id="importDialog" class="ui-dialog" role="dialog">'+
		'	<div class="ui-dialog-titlebar">'+
		'		<span class="ui-dialog-title">Import</span>'+
		'	</div>'+
		'	<div class="ui-dialog-content">'+
		'		<textarea id="importText"></textarea>'+
		'	</div>'+
		'</div>'
	)
});

