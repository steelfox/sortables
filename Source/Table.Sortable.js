/*
---

name: Table.Sortable.js

description: Gives tables a sortable behavior

license: MIT-style license.

author: Stian Didriksen <stian@nooku.org>

copyright: Copyright needs to be Timble CVBA. (http://www.timble.net) All rights reserved.

requires: [Drag.Sortable]

provides: Table.Sortable

...
*/

if (!$chk(Table)) var Table = {};

Table.Sortable = new Class({

	Extends: Drag.Sortable,

	options: {

		zebra: true,
		constrain: true,
		numcolumn: false,


		onSort: function(){

			this.clone.inject(this.element, 'before');
			this.ghost.inject(this.element, 'after');

		},

		onComplete: function(){

			var key = this.lists.indexOf(this.list);

			this.adapters[key].store(this, this.serialize(key));

			if(this.options.numcolumn) {

				(function(){
					var numbers = [];
					this.list.getElements(this.options.numcolumn).each(function(row){
						numbers.push(row.get('text').toInt());
					}, this);
					numbers.sort(function(a, b){
						return a > b;
					});
					this.list.getChildren().each(function(row, i){
						var numcol = row.getElement(this.options.numcolumn);
						if(numcol) numcol.set('text', numbers[i]);
						if(i % 2) {
							row.removeClass('row0').addClass('row1');
						} else {
							row.removeClass('row1').addClass('row0');
						}
					}, this);
				}.bind(this)).delay(400);
			}

		}
	},

	start: function(event, element){

		this.parent(event, element);

		var spacing = this.element.getParents('table')[0].getStyle('border-spacing').split(' ')[0].toInt(), 
			cells = this.clone.getChildren();

		this.element.getChildren().each(function(cell, i){
			cells[i].setStyles({
				width: this._getOffsetSize(cell),
				height: this._getOffsetSize(cell, true),
				paddingTop: cell.getStyle('padding-top'),
				paddingRight: cell.getStyle('padding-right'),
				paddingBottom: cell.getStyle('padding-bottom'),
				paddingLeft: cell.getStyle('padding-left')
			});
		}, this);

		this.ghost = this.getClone(new Event, element);
		this.ghost.inject(this.element, 'after');

	},

	reset: function(){

		this.parent();

		this.ghost.destroy();

	},

	_getOffsetSize: function(cell, vertical){
		var keys = vertical ? ['y', 'top', 'bottom'] : ['x', 'left', 'right'];
		return cell.getSize()[keys[0]] 
		- cell.getStyle('padding-'+keys[1]).toInt() 
		- cell.getStyle('padding-'+keys[2]).toInt();
	}

});

Element.implement({

	sortable: function(options){

		if(!this.$sortable) this.$sortable = this.get('tag') == 'tbody' ? new Table.Sortable(this, options) : new Drag.Sortable(this, options);

		return this.$sortable;

	}

});