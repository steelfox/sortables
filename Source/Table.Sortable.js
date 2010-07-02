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
		onStart: function(element){
		
			//Change the trash to the same element as the list, to avoid jumpy dragging
			this.trash.adopt(new Element('table').adopt(this.ghost.getParent()));
		
			var cells = this.ghost.getChildren();
			
			element.getChildren().each(function(cell, i){
				cells[i].setStyle('width', cell.getSize().scroll.x);
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