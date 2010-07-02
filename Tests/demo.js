window.addEvent('domready', function(){
	// We autogenerate a list on the fly
	var li = [];
	
	for (i = 1; i <= 5; i++) {
		li.push(new Element('li').setText('Item #'+i));
	}
	
	var ul = new Element('ul', {
		'class': 'myList'
	}).inject('sortables').adopt(li).sortable();
	
	// We autogenerate a table on the fly
	var tr = [];
	
	for (i = 1; i <= 5; i++) {
		tr.push(new Element('tr').adopt(
			new Element('td', {'class': 'handle'}).setHTML('&#9776;'),
			new Element('td').adopt(new Element('input', {type: 'checkbox'})),
			new Element('td').setText('Item #'+i)
		));
	}
	
	$('rows').adopt(tr).sortable({handles: '.handle'});
	
	//new Sortables(ul);
});