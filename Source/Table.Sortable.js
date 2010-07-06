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

Table.Sortable = Drag.Sortable.extend({

	options: {
		offset: 2,
		onStart: function(element){

			var spacing = element.getParent().getParent().getStyle('border-spacing').split(' ')[0].toInt(), 
				cells = this.ghost.getChildren(), 
				table = new Element('table', {'style': 'border-spacing: ' + spacing + 'px 0px'}).adopt(this.ghost.getParent());
			
			//Change the trash to the same element as the list, to avoid jumpy dragging
			this.trash.adopt(table);
			
			element.getChildren().each(function(cell, i){
				cells[i].setStyle('width', cell.getSize().size.x - cell.getStyle('padding-left').toInt() - cell.getStyle('padding-right').toInt());
			}, this);
		}
	}

});

Element.extend({

	sortable: function(options){

		if(!this.$sortable) this.$sortable = this.getTag() == 'tbody' ? new Table.Sortable(this, options) : new Drag.Sortable(this, options);
		
		return this.$sortable;

	}

});