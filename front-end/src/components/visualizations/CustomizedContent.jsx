import React, { Component } from 'react';

class CustomizedContent extends Component {
    static defaultProps = {
      root: null,
      depth: null,
      x: null,
      y: null,
      width: null,
      height: null,
      index: null,
      payload: null,
      colors: null,
      rank: null,
      name: null,
    }

    render = () => (
      <g>
        <rect
          x={this.props.x}
          y={this.props.y}
          width={this.props.width}
          height={this.props.height}
          style={{
            fill: this.props.colors[this.props.index],
            stroke: '#fff',
            strokeWidth: 2 / (this.props.depth + 1e-10),
            strokeOpacity: 1 / (this.props.depth + 1e-10),
          }}
        />
        {
          this.props.depth === 1 ?
            <text
              x={this.props.x + this.props.width / 2}
              y={this.props.y + this.props.height / 2 + 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
            >
              {this.props.name}
            </text>
            : null
        }
      </g>
    );
}

export default CustomizedContent;
