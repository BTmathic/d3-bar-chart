import 'normalize.css/normalize.css';
import './styles/styles.scss';
import * as d3 from 'd3';

fetch('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json').then((response) => {
  return response.json();
}).then((data) => {
  let margin;
  let height, width;

  let svg = d3.select('#container').append('svg');
  let popup = d3.select('body').append('div');
  let description = d3.select('#container').append('div');
  let x,y;
  
  const gdpData = data.data;
  const gdpAmounts = data.data.map((entry) => entry[1]);
  const gdpDates = data.data.map((entry) => entry[0]);
  let barWidth;

  main();

  function main() {
    popup.attr('class', 'tooltip')
      .style('opacity', 0);

    setSizes();
    drawGraph();
  }

  function setSizes() {
    margin = { top: 20, right: 20, bottom: 20, left: 75 };
    height = 450 - margin.top - margin.bottom;
    width = 865 - margin.left - margin.right;
    barWidth = width / gdpAmounts.length;

    x = d3.scaleTime().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    x.domain([new Date(gdpDates[0]), new Date(gdpDates[gdpDates.length - 1])]);
    y.domain([0, d3.max(gdpAmounts)]);
  }

  function drawGraph() {
    svg.append('g')
    .attr('transform', `translate(${margin.left}, ${height})`)
    .call(d3.axisBottom(x).tickFormat((date) => d3.timeFormat('%Y')(date)));

  svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  svg.append('text')
    .attr('transform', `rotate(-90) translate(${margin.left}, 0)`)
    .attr('y', 0 - margin.left + 20)
    .attr('x', 0 - height/2)
    .attr('dy', '0em')
    .style('text-anchor', 'middle')
    .text('GDP (in billions)')
  
  svg.append('g')
    .selectAll('rect')
    .data(gdpData)
    .enter()
    .append('rect')
    .attr('fill', 'steelblue')
    .attr('width', barWidth)
    .attr('height', (d) => height*d[1] / d3.max(gdpAmounts, (amount) => amount))
    .attr('transform', (d, i) => {
      const pad = margin.left + i*barWidth;
      return 'translate(' + pad + ',' + height + ') ' + 'scale(1, -1)'
    })
    .on('mouseover', (d) => mouseover(d))
    .on('mouseout', mouseout);

  description
    .attr('class', 'description')
    .style('max-width', '925px')
    .style('font-size', '12px')
    .style('padding-left', '15px')
    .style('text-align', 'center')

  description.append("text")
    .text(data.description);
  }

  function mouseover(d) {
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
  }

  function mouseout() {
    popup.transition()
      .duration(500)
      .style('opacity', 0);
  }

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
});