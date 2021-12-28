
// **** Your JavaScript code goes here ****
d3.csv('baseball_hr_leaders_2017.csv').then(function(dataset) {
	d3.select('#homerun-leaders').selectAll('p')
	.data(dataset)
	.enter()
	.append('p')
	.text(function(d) {return d.rank + ". " + d.name + " with " + d.homeruns + " home runs"})
	.style('font-weight', function(d) {
		return d.rank == '1' ? 'bold' : 'normal';
	})

	d3.select('#homerun-table').select('thead').selectAll('td')
	.style('background-color', '#CDCDCD')
	
	var row = d3.select('#homerun-table').select('tbody').selectAll('tr')
	.data(dataset)
	.enter()
	.append('tr')

	row.append('td')
	.text(function(d) {return d.rank})
	.style('text-align', 'center')
	row.append('td')
	.text(function(d) {return d.name})
	row.append('td')
	.text(function(d) {return d.homeruns})
	.style('text-align', 'center')
});
