/*
---

name: Sortables.js

description: Drag and drop sorting of lists

license: MIT-style license.

author: Stian Didriksen <stian@nooku.org>

copyright: Copyright needs to be Timble CVBA. (http://www.timble.net) All rights reserved.

requires: [Class]

provides: Sortables

...
*/

var Sortables = new Class({

	options: {
		url: '#',
		list: false,
		duration: 300,
		onStart: Class.empty,
		onComplete: Class.empty,
		ghost: true,
		offset: 0,
		snap: 3,
		onDragStart: function(element, shadow){
			element.setStyle('opacity', 0);
			shadow.effects({duration: this.options.duration, transition: Fx.Transitions.Sine.easeInOut}).start({
//				opacity: [1, 0.2]
			});
			shadow.addClass('animate');
		},
		onDragComplete: function(element, shadow){
					
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
			console.log(order);
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
		}
	},
	
	handles: [],

	initialize: function(options){
		this.setOptions(options);

		this.list = this.options.list;
		
		this.elements = this.list.getChildren();

		if(this.elements.length < 2) return;

		if(this.options.handles)
		{
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
				//'overflow':'hidden',
				'left': event.page.x - this.offset.x,
				'top': event.page.y - this.offset.y,
				//width: size.size.x,
				//height: size.size.y
			}).adopt(
				this.list.clone().empty().adopt(
					el.clone()
				)
			);

			document.addListener('mousemove', this.bound.moveGhost);
			this.fireEvent('onDragStart', [el, this.ghost]);
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
		} else {
			value.x = this.coordinates.left;
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
			this.fireEvent('onDragComplete', [this.active, this.ghost]);
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

Sortables.implement(new Events, new Options);

Element.extend({

	sortable: function(options){
		if(!options) options = {};
		if(!this.$sortables) this.$sortables = new Sortables($merge({list: this}, options));
		
		return this.$sortables;
	}

});