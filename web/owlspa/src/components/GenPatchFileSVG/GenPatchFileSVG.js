import React, { Component, PropTypes } from 'react';
import GenPatchBoxText from './GenPatchBoxText';
import GenPatchBoxCode from './GenPatchBoxCode';

class GenPatchFileSVG extends Component {

  constructor(props){
    super(props);
  }

  createArray(length){
    const Arr = [];
    while(length > 0){
      Arr.push(length);
      length--;
    }
    return Arr;
  }

  getPortSpacing(width, numPorts){
    const widthPadding = 20;
    const usableWidth = width - widthPadding;
    return numPorts > 1 ? usableWidth / (numPorts - 1) : usableWidth;
  }

  renderInletsAndOutLets(numinlets, numoutlets, x, y, width, height){
    if(!numinlets && !numoutlets){
      return null;
    }
    let inletsArr = [];
    let outletsArr = [];
    let inletSpacing;
    let outletSpacing;
    if(numinlets){
      inletSpacing = this.getPortSpacing(width, numinlets);
      inletsArr = this.createArray(numinlets);
    }

    if(numoutlets){
      outletSpacing = this.getPortSpacing(width, numoutlets);
      outletsArr = this.createArray(numoutlets);
    }
    return (
      <g>
        { inletsArr.map((inlet , i) => {
          return <ellipse key={i} cx={10 + inletSpacing * i } fill="#555" cy="1" rx="3" ry="2" stroke="#faa"/>
        }) }
        { outletsArr.map((outlet , i) => {
          return <ellipse key={i} cx={10 + outletSpacing * i } fill="#555" cy={height - 1} rx="3" ry="2" stroke="#efb"/>
        }) }
      </g>
    );
  }

  renderNewObjs(boxes=[]){
    return boxes.map((box, i) => {
      const x = box.box.patching_rect[0];
      const y = box.box.patching_rect[1];
      const width = box.box.patching_rect[2];
      const height = box.box.patching_rect[3];
      const text = box.box.text;
      const numinlets = box.box.numinlets;
      const numoutlets = box.box.numoutlets;
      return (
        <svg width={width} height={height} x={x} y={y} key={i}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#888" />
          <rect
            x={0}
            y={4}
            width={width}
            height={height - 8}
            fill="#555" />
          { this.renderInletsAndOutLets(numinlets, numoutlets, x, y, width, height)}
          <GenPatchBoxText
            x={4}
            y={15}
            boxWidth={width}
            text={text} />
        </svg>
      );
    });
  }

  renderComments(boxes=[]){
    return boxes.map((box, i) => {
      const x = box.box.patching_rect[0];
      const y = box.box.patching_rect[1];
      const width = box.box.patching_rect[2];
      const height = box.box.patching_rect[3];
      const text = box.box.text;
      return (
        <svg style={{overflow: 'visible'}} width={width} height={height} x={x} y={y} key={i}>
          <GenPatchBoxText
            x={4}
            y={15}
            color="#777"
            boxWidth={width}
            comment={true}
            text={text} />
        </svg>
      );
    });
  }

  renderCodeBoxes(codeBoxes=[]){
    return codeBoxes.map((box, i) => {
      const x = box.box.patching_rect[0];
      const y = box.box.patching_rect[1];
      const width = box.box.patching_rect[2];
      const height = box.box.patching_rect[3];
      const code = box.box.code;
      const numinlets = box.box.numinlets;
      const numoutlets = box.box.numoutlets;
      return (
        <svg width={width} height={height} x={x} y={y} key={i}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            rx="8"
            ry="8"
            fill="#888" />
          <rect
            x={4}
            y={16}
            width={width - 8}
            height={height - 32}
            fill="#fff" />
          <rect
            x={4}
            y={16}
            width={31}
            height={height - 32}
            fill="#888" />
          <rect
            x={4}
            y={16}
            width={30}
            height={height - 32}
            fill="#e9e9e9" />
          <text
            x={width - 53}
            y={12}
            fontFamily="Arial"
            fontSize="11"
            fill="#ddd" >
            CodeBox
          </text>
          { this.renderInletsAndOutLets(numinlets, numoutlets, x, y, width, height)}
          <GenPatchBoxCode
            x={24}
            y={28}
            code={code} />
        </svg>
      );
    });
  }

  getBoxById(id){
    const { data:{ patcher:{ boxes } } } = this.props;
    return boxes.filter(box => box.box.id === id)[0];
  }

  getPortCoord(port, type){
    const box = this.getBoxById(port[0]);
    if(!box){
      console.error('box not found with id', port[0]);
    }
    const isSource = type === 'source';
    const portIndex = port[1];
    const boxX = box.box.patching_rect[0];
    const boxY = box.box.patching_rect[1];
    const width = box.box.patching_rect[2];
    const height = box.box.patching_rect[3];
    const numports = isSource ? box.box.numoutlets : box.box.numinlets;
    const portSpacing = this.getPortSpacing(width, numports)
    return {
      x: boxX + 10 + portSpacing * portIndex,
      y: boxY + (isSource ? height - 1 : 1)
    }
  }

  getLinePoints(source, destination){
    const { x:x1, y:y1 } = this.getPortCoord(source, 'source');
    const { x:x2, y:y2 } = this.getPortCoord(destination, 'destination');
    return { x1, y1, x2, y2 }
  }

  renderPatchLines(patchLines){
    return patchLines.map((line, i) => {
      const {x1, y1, x2, y2} = this.getLinePoints(line.source, line.destination);
      return (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}  stroke="#888" strokeWidth="2" />
      );
    });
  }

  getSVGwidthFromFurthestXYPositionedBox(boxes){
    const furthestDimnesions = { width: 0, height: 0 };
    if(!boxes){
      return furthestDimnesions;
    }
    return boxes.reduce((acc, { box: { patching_rect } }) => {
      const x = patching_rect[0];
      const y = patching_rect[1];
      const width = patching_rect[2];
      const height = patching_rect[3];
      const xCorner = x + width;
      const yCorner = y + height;
      acc.width = acc.width < xCorner ? xCorner : acc.width;
      acc.height = acc.height < yCorner ? yCorner : acc.height;
      return acc;
    }, furthestDimnesions);
  }


  render(){
    const { data:{ patcher:{ rect, boxes, lines } } } = this.props;
    const newObjs = boxes.filter(box => box.box.maxclass === 'newobj');
    const codeBoxes = boxes.filter(box => box.box.maxclass === 'codebox');
    const comments = boxes.filter(box => box.box.maxclass === 'comment');
    const patchLines = lines.map(line => line.patchline);
    const { width, height } = this.getSVGwidthFromFurthestXYPositionedBox(boxes);

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width || rect[2]}
        height={height || rect[3]}
        style={{overflow: 'visible', margin: '50px 0'}} >

        { this.renderPatchLines(patchLines) }
        { this.renderNewObjs(newObjs) }
        { this.renderCodeBoxes(codeBoxes) }
        { this.renderComments(comments) }

      </svg>
    );
  }
}

GenPatchFileSVG.proptypes = {
  data: PropTypes.object.isRequired
}

export default GenPatchFileSVG;
