/*
---

name: Table.Sortables.js

description: Gives tables a sortable behavior

license: MIT-style license.

author: Stian Didriksen <stian@nooku.org>

copyright: Copyright needs to be Timble CVBA. (http://www.timble.net) All rights reserved.

requires: [Class, Sortables]

provides: Table.Sortables

...
*/

if (!$chk(Table)) var Table = {};

Table.Sortables = Sortables.extend({

	options: {
		url: '#',
		canSaveOrder: 1,
		saveDelay: 1000,
		form: 'adminForm',
		list: '.adminlist tbody',
		handles: 'td.handle',
		duration: 300,
		onStart: Class.empty,
		onComplete: Class.empty,
		ghost: true,
		offset: 0,
		snap: 3,
		tree: false,
		onDragStart: function(element, shadow, ghost){
			element.setStyle('opacity', 0);
			ghost.setStyles({
				opacity: 1
			});
			shadow.style.webkitTransitionDuration = this.options.duration + 'ms';
			shadow.effects({duration: this.options.duration, transition: Fx.Transitions.Sine.easeInOut}).start({
//				opacity: [1, 0.2]
			});
			shadow.addClass('animate');
		},
		onDragComplete: function(element, shadow, ghost){
					
			shadow.element = element;
			shadow.options = this.options;
			shadow.trash = this.trash;
			
			pos = element.getPosition();
			shadow.removeClass('animate');
			shadow.effects({duration: this.options.duration, transition: Fx.Transitions.Sine.easeInOut, onComplete:function(shadow){
				shadow.options.emptyTrash(shadow);
				shadow.element.setStyles({'opacity':1});
				shadow.remove();
			}}).start({
//				opacity: 1,
				top: pos.y,
				left: pos.x
			});
		},
		
		onOrderChange: function(order){
				form = $(this.options.form);
					var success = this.options.msg.success;
					$(this.options.form).send({
					data: {
						action: 'order',
						ordering: Json.toString(order),
						_token: $(this.options.form).getElement('input[name="_token"]').getValue()
					}
				});	
		},
		
		emptyTrash: function(e){
			e.trash.remove();
		},
		
		onMorphStart: function(ghost){
			ghost.addClass('morph').addClass('morphStart');
			(function(){ ghost.removeClass('morphStart'); }).delay(500);
			//$$('.droppable').each(function(e){
			//	e.addEvent('mousemove', function(){
			//		this.addClass('active');
			//	});
			//});
			
		},
		onMorphEnd: function(ghost){
			ghost.addClass('morphEnd');
			(function(){ ghost.removeClass('morph').removeClass('morphEnd'); }).delay(500);
			//$$('.droppable').each(function(e){
			//	e.removeEvent('mousemove').removeClass('active');
			//});
		}
	},

	initialize: function(options){
		this.setOptions(options);
		this.list = $$(this.options.list)[0];
		this.elements = this.list.getChildren().filterByClass('sortable');
		if(this.elements.length <= 1) return;
		this.morphing = false;
		if (this.options.initialize) this.options.initialize.call(this);
		if(this.options.handles)
		{
			this.handles = new Array;
			this.elements.each(function(e,i){ 
				this.handles[i] = e.getElement(this.options.handles);
			}.bind(this));
		}
		else this.handles = this.elements;
		this.bound = {
			'start': [],
			'moveGhost': this.moveGhost.bindWithEvent(this)
		};
		for (var i = 0, l = this.handles.length; i < l; i++){
			this.bound.start[i] = this.start.bindWithEvent(this, this.elements[i]);
		}
		//this.options.order = this.serialize();
		this.attach();
		
		//We need to make this support tree lists before we can use it again.
//		this.list.addEvent('mousedown', function(event){
//			if(event.target.hasClass('handle')) new NSortables(options); $(event.target).fireEvent('mousedown');
//		}, this);
		this.bound.move = this.move.bindWithEvent(this);
		this.bound.end = this.end.bind(this);
	},

	attach: function(){
		this.handles.each(function(handle, i){
			handle.addEvent('mousedown', this.bound.start[i]);
		}, this);
	},

	detach: function(){
		this.handles.each(function(handle, i){
			handle.removeEvent('mousedown', this.bound.start[i]);
		}, this);
	},

	start: function(event, el){
		this.active = el;
		this.coordinates = this.list.getCoordinates();
		if (this.options.ghost){
			var position = el.getPosition();
			var size	 = el.getSize();
			this.offset = {y: event.page.y - position.y, x: event.page.x - position.x};
			this.trash = new Element('div', {'class':'ghost-outer'}).inject(document.body);
			this.ghost = new Element('div', {'class':'ghost-shadow'}).inject(this.trash).setStyles({
				'position': 'absolute',
				'overflow':'hidden',
				'left': event.page.x - this.offset.x,
				'top': event.page.y - this.offset.y,
				width: size.size.x,
				height: size.size.y
			});
			
			var treeClass = this.options.tree ? ' treelist' : '';
			this.innerghost = new Element('table', {'class':'adminlist ghost nowrap' + treeClass}).inject(this.ghost);
			clone = el.clone();
			this.ghostelement = clone.inject(new Element('tbody').inject(this.innerghost));
			el.getChildren().each(function(td, i){
				var cloned = clone.getChildren()[i];
				$$(cloned, td).setStyle('width', '');
				var size = {cloned: cloned.getSize().size.x - cloned.getStyle('padding-left').toInt() - cloned.getStyle('padding-right').toInt(), td: td.getSize().size.x - td.getStyle('padding-left').toInt() - td.getStyle('padding-right').toInt()};
				size.cloned > size.td ? td.setStyle('width', size.cloned) : cloned.setStyle('width', size.td);
			});
			document.addListener('mousemove', this.bound.moveGhost);
			console.log(el);
			this.fireEvent('onDragStart', [el, this.ghost, this.ghostelement]);
		}
		document.addListener('mousemove', this.bound.move);
		document.addListener('mouseup', this.bound.end);
		this.fireEvent('onStart', el);
		event.stop();
	},

	moveGhost: function(event){
		var value = {x: event.page.x - this.offset.x, y: event.page.y - this.offset.y};
		if(event.page.y > this.coordinates.top) {
			value.x = this.coordinates.left;
			if(this.morphing) {
				this.fireEvent('onMorphEnd', [this.ghost]);
				this.morphing = false;
			}
			
		} else {
			if(this.morphing) {
				this.fireEvent('onMorphStart', [this.ghost]);
				this.morphing = true;
			} else {
				value.x = this.coordinates.left;
			}
		}
		//value = value.limit(this.coordinates.top, this.coordinates.bottom - this.ghost.offsetHeight);
		value.y = value.y.limit(this.coordinates.top, this.coordinates.bottom - this.ghost.offsetHeight);
		//this.ghost.setStyle('top', value);
		this.ghost.setStyles({'top': value.y, 'left': value.x});
		event.stop();
	},

	move: function(event){
		var now = event.page.y;
		this.previous = this.previous || now;
		var up = ((this.previous - now) > 0);
		var prev = this.active.getPrevious();
		var next = this.active.getNext();
		if (prev && up && now < prev.getCoordinates().bottom) {
			this.active.injectBefore(prev);
		}
		if (next && !up && now > next.getCoordinates().top) {
			this.active.injectAfter(next);
		}
		this.previous = now;
	},

	serialize: function(converter){
		i = 0;
		return this.list.getChildren().filterByClass('sortable').map(converter || function(el){
			index = this.elements.indexOf(el);
			return {id:this.elements[index].getElement('input[name^="id"]').value,ordering:(i++)};
		}, this);
	},

	end: function(){
		this.previous = null;
		document.removeListener('mousemove', this.bound.move);
		document.removeListener('mouseup', this.bound.end);
		if (this.options.ghost){
			document.removeListener('mousemove', this.bound.moveGhost);
			if(this.morphing) {
				this.fireEvent('onMorphEnd', [this.ghost]);
				this.morphing = false;
			}
			this.fireEvent('onDragComplete', [this.active, this.ghost, this.ghostelement]);
			if(Json.toString(this.serialize()) != Json.toString(this.options.order)&&this.options.canSaveOrder){ 
				this.options.canSaveOrder = false;
				(function(){
					this.options.canSaveOrder = true;
					this.options.order = this.serialize();
					this.fireEvent('onOrderChange', [this.serialize()]);
				}).delay(this.options.saveDelay, this);
			}
		}
		this.fireEvent('onComplete', this.active);
	}

});