import 'normalize.css/normalize.css';
import './styles/styles.scss';
import * as d3 from 'd3';

fetch('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json').then(function (response) {
  return response.json();
}).then(function (data) {
  const gdpData = data.data;
  const gdpAmounts = data.data.map((entry) => entry[1]);
  const gdpDates = data.data.map((entry) => entry[0]);

  const margin = { top: 20, right: 20, bottom: 20, left: 50};
  const width = 865 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const barWidth = width / gdpAmounts.length;

  let svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  x.domain([new Date(gdpDates[0]), new Date(gdpDates[gdpDates.length - 1])]);
  y.domain([0, d3.max(gdpAmounts)]);

  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat((date) => d3.timeFormat('%Y')(date)));

  svg.append('g')
    .call(d3.axisLeft(y));

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - height/2)
    .attr('dy', '0em')
    .style('text-anchor', 'middle')
    .text('GDP (in billions)')

  const getDate = (month) => {
    switch (month) {
      case '01':
        return 'January';
      case '04':
        return 'April';
      case '07':
        return 'July';
      case '10':
        return 'October';
    }
  }

  const popup = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
  
  svg.append('g')
    .selectAll('rect')
    .data(gdpData) // gdpAmounts
    .enter()
    .append('rect')
    .attr('fill', 'steelblue')
    .attr('width', barWidth)
    .attr('height', (d) => height*d[1] / d3.max(gdpAmounts, (amount) => amount))
    .attr('transform', (d, i) => `translate(${i * barWidth}, ${height})  scale(1, -1)`)
    .on('mouseover', (d) => {
      popup.transition()
        .duration(200)
        .style('opacity', 0.9);
      const rect = d3.select(d);
      const rectDate = rect._groups[0][0][0].split('-');
      const rectAmount = rect._groups[0][0][1].toString().split('.');
      let amount;
      if (rectAmount.length === 1) {
        amount = '$' + rectAmount[0].concat('.00');
      } else {
        amount = '$' + rectAmount[0].concat('.' + rectAmount[1]).concat('0');
      }
      popup.html(`<div id='amount'>${amount} Billion</div><div id='date'>${getDate(rectDate[1])}, ${rectDate[0]}</div>`)
        .style('left', (d3.event.pageX + 5) + 'px')
        .style('top', (d3.event.pageY - 50) + 'px')
    }).on('mouseout', (d) => {
        popup.transition()
          .duration(500)
          .style('opacity', 0);
    });

  const description = d3.select('body').append('div')
    .attr('class', 'description')
    .style('max-width', '925px')
    .style('font-size', '12px')
    .style('padding-left', '15px')
    .style('text-align', 'center')

  description.append("text")
    .text(data.description);

});