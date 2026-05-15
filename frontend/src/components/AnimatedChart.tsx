import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { gsap } from 'gsap';
import { DataPoint, DataSeries } from '../types';

interface AnimatedChartProps {
  series: DataSeries[];
  width?: number;
  height?: number;
  showInflectionPoints?: boolean;
  showPeakPoints?: boolean;
  showOutliers?: boolean;
}

const COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
];

export const AnimatedChart: React.FC<AnimatedChartProps> = ({
  series,
  width = 800,
  height = 500,
  showInflectionPoints = true,
  showPeakPoints = true,
  showOutliers = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || series.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const allPoints = series.flatMap((s) => s.points);
    const xExtent = d3.extent(allPoints, (d) => d.x) as [number, number];
    const yExtent = d3.extent(allPoints, (d) => d.y) as [number, number];

    const xPadding = (xExtent[1] - xExtent[0]) * 0.05;
    const yPadding = (yExtent[1] - yExtent[0]) * 0.05;

    const xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight).tickPadding(10);
    const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('.tick line')
      .attr('stroke', 'rgba(255,255,255,0.1)');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('.tick line')
      .attr('stroke', 'rgba(255,255,255,0.1)');

    g.selectAll('.domain').attr('stroke', 'rgba(255,255,255,0.2)');
    g.selectAll('.tick text').attr('fill', '#a1a1aa');

    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    series.forEach((s, seriesIndex) => {
      const color = COLORS[seriesIndex % COLORS.length];

      const gradient = g
        .append('linearGradient')
        .attr('id', `gradient-${seriesIndex}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.3);
      gradient.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0);

      const area = d3
        .area<DataPoint>()
        .x((d) => xScale(d.x))
        .y0(innerHeight)
        .y1((d) => yScale(d.y))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(s.points)
        .attr('class', `area-${seriesIndex}`)
        .attr('fill', `url(#gradient-${seriesIndex})`)
        .attr('opacity', 0);

      g.append('path')
        .datum(s.points)
        .attr('class', `line-${seriesIndex}`)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      const pointsGroup = g.append('g').attr('class', `points-${seriesIndex}`);

      if (showInflectionPoints) {
        pointsGroup
          .selectAll(`.inflection-${seriesIndex}`)
          .data(s.points.filter((p) => p.isInflection))
          .enter()
          .append('circle')
          .attr('class', `inflection-point inflection-${seriesIndex}`)
          .attr('cx', (d) => xScale(d.x))
          .attr('cy', (d) => yScale(d.y))
          .attr('r', 0)
          .attr('fill', '#f59e0b')
          .attr('stroke', '#fbbf24')
          .attr('stroke-width', 2);
      }

      if (showPeakPoints) {
        pointsGroup
          .selectAll(`.peak-${seriesIndex}`)
          .data(s.points.filter((p) => p.isPeak))
          .enter()
          .append('circle')
          .attr('class', `peak-point peak-${seriesIndex}`)
          .attr('cx', (d) => xScale(d.x))
          .attr('cy', (d) => yScale(d.y))
          .attr('r', 0)
          .attr('fill', '#ef4444')
          .attr('stroke', '#f87171')
          .attr('stroke-width', 2);
      }

      if (showOutliers) {
        pointsGroup
          .selectAll(`.outlier-${seriesIndex}`)
          .data(s.points.filter((p) => p.isOutlier))
          .enter()
          .append('circle')
          .attr('class', `outlier-${seriesIndex}`)
          .attr('cx', (d) => xScale(d.x))
          .attr('cy', (d) => yScale(d.y))
          .attr('r', 0)
          .attr('fill', 'none')
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3,3');
      }

      pointsGroup
        .selectAll(`.regular-${seriesIndex}`)
        .data(s.points.filter((p) => !p.isInflection && !p.isPeak && !p.isOutlier))
        .enter()
        .append('circle')
        .attr('class', `regular-point regular-${seriesIndex}`)
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('r', 0)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1);
    });

    const legend = g
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(10, 10)`);

    series.forEach((s, i) => {
      const legendItem = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendItem
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 20)
        .attr('y2', 0)
        .attr('stroke', COLORS[i % COLORS.length])
        .attr('stroke-width', 3);

      legendItem
        .append('text')
        .attr('x', 25)
        .attr('y', 4)
        .text(s.name)
        .attr('fill', '#a1a1aa')
        .attr('font-size', '12px');
    });

    const tl = gsap.timeline({ delay: 0.2 });

    series.forEach((s, seriesIndex) => {
      const path = svg.select(`.line-${seriesIndex}`).node() as SVGPathElement;
      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(path, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' }, `-=${seriesIndex > 0 ? 1 : 0}`);
      }

      const areaPath = svg.select(`.area-${seriesIndex}`).node();
      if (areaPath) {
        tl.to(areaPath, { opacity: 1, duration: 1 }, `-=${1}`);
      }

      const regularPoints = svg.selectAll(`.regular-${seriesIndex}`).nodes();
      if (regularPoints.length > 0) {
        tl.to(
          regularPoints,
          { r: 3, duration: 0.4, stagger: 0.02, ease: 'back.out(1.7)' },
          `-=${0.8}`,
        );
      }

      const inflectionPoints = svg.selectAll(`.inflection-${seriesIndex}`).nodes();
      if (inflectionPoints.length > 0) {
        tl.to(
          inflectionPoints,
          { r: 8, duration: 0.5, stagger: 0.1, ease: 'elastic.out(1, 0.5)' },
          `-=${0.5}`,
        );
      }

      const peakPoints = svg.selectAll(`.peak-${seriesIndex}`).nodes();
      if (peakPoints.length > 0) {
        tl.to(
          peakPoints,
          { r: 7, duration: 0.5, stagger: 0.1, ease: 'bounce.out' },
          `-=${0.5}`,
        );
      }

      const outlierPoints = svg.selectAll(`.outlier-${seriesIndex}`).nodes();
      if (outlierPoints.length > 0) {
        tl.to(
          outlierPoints,
          { r: 10, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
          `-=${0.4}`,
        );
      }
    });

    return () => {
      tl.kill();
    };
  }, [series, dimensions, showInflectionPoints, showPeakPoints, showOutliers]);

  return (
    <div ref={containerRef} className="chart-container w-full h-full p-4">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
