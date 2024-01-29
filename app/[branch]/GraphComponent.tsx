'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import capitalizeFirstLetter from './helpers/capitalizeFirstLetter';
import useFetchConceptData from './hooks/useFetchConceptData';

const GraphComponent = ({ data, branch }) => {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [focusedNode, setFocusedNode] = useState(null);

  const conceptData = useFetchConceptData(focusedNode);

  const mainNode = data.nodes.find((node) => node.name === capitalizeFirstLetter(branch));

  useEffect(() => {
    if (mainNode && fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(800, 40);
      }, 800);
    }
  }, [mainNode]);

  useEffect(() => {
    if (mainNode) {
      const connectedNodes = data.nodes.filter((n) =>
        data.links.some(
          (l) =>
            (l.source === mainNode.id && l.target === n.id) ||
            (l.target === mainNode.id && l.source === n.id),
        ),
      );

      const connectedLinks = data.links.filter(
        (l) => l.source === mainNode.id || l.target === mainNode.id,
      );

      setGraphData({
        nodes: [mainNode, ...connectedNodes],
        links: connectedLinks,
      });
      setFocusedNode(mainNode);
    }
  }, []);

  const findConnectedNodes = (nodeId) => {
    return data.links.filter((link) => link.source.id === nodeId).map((link) => link.target.id);
  };

  const findParentNode = (nodeId) => {
    const parentNodeLink = data.links.find((link) => link.target.id === nodeId);
    return parentNodeLink ? parentNodeLink.source.id : null;
  };

  const handleClick = useCallback(
    (node) => {
      const connectedNodes = data.nodes.filter((n) =>
        data.links.some(
          (l) =>
            (l.source === node.id && l.target === n.id) ||
            (l.target === node.id && l.source === n.id),
        ),
      );

      const connectedLinks = data.links.filter((l) => l.source === node.id || l.target === node.id);

      setGraphData((prevGraphData) => ({
        nodes: [...new Set([...prevGraphData.nodes, ...connectedNodes])],
        links: [...new Set([...prevGraphData.links, ...connectedLinks])],
      }));

      setFocusedNode(node);
    },
    [data],
  );

  useEffect(() => {
    if (focusedNode) {
      fgRef.current.centerAt(focusedNode.x, focusedNode.y, 1000);

      setTimeout(() => fgRef.current.centerAt(focusedNode.x, focusedNode.y, 1000), 500);
    }
  }, [focusedNode]);

  const handleKeyDown = useCallback(() => {
    if (focusedNode) {
      const connectedNodes = findConnectedNodes(focusedNode.id);
      if (connectedNodes.length > 0) {
        const firstChildNode = data.nodes.find((node) => node.id === connectedNodes[0]);
        setFocusedNode(firstChildNode);
      }
    }
  }, [focusedNode, data.nodes]);

  const handleKeyUp = useCallback(() => {
    if (focusedNode) {
      const parentNodeId = findParentNode(focusedNode.id);
      if (parentNodeId) {
        const parentNode = data.nodes.find((node) => node.id === parentNodeId);
        setFocusedNode(parentNode);
      }
    }
  }, [focusedNode, data.nodes]);

  const handleKeyRight = useCallback(() => {
    if (focusedNode) {
      const parentNodeId = findParentNode(focusedNode.id);
      if (parentNodeId) {
        const siblings = findConnectedNodes(parentNodeId);
        const currentIndex = siblings.indexOf(focusedNode.id);
        if (currentIndex >= 0 && currentIndex < siblings.length - 1) {
          const nextSiblingId = siblings[currentIndex + 1];
          const nextSibling = data.nodes.find((node) => node.id === nextSiblingId);
          setFocusedNode(nextSibling);
        }
      }
    }
  }, [focusedNode, data.nodes]);

  const handleKeyLeft = useCallback(() => {
    if (focusedNode) {
      const parentNodeId = findParentNode(focusedNode.id);
      if (parentNodeId) {
        const siblings = findConnectedNodes(parentNodeId);
        const currentIndex = siblings.indexOf(focusedNode.id);
        if (currentIndex > 0) {
          const prevSiblingId = siblings[currentIndex - 1];
          const prevSibling = data.nodes.find((node) => node.id === prevSiblingId);
          setFocusedNode(prevSibling);
        }
      }
    }
  }, [focusedNode, data.nodes]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && focusedNode) {
        handleClick(focusedNode);
      } else if (event.key === 'ArrowDown') {
        handleKeyDown();
      } else if (event.key === 'ArrowUp') {
        handleKeyUp();
      } else if (event.key === 'ArrowRight') {
        handleKeyRight();
      } else if (event.key === 'ArrowLeft') {
        handleKeyLeft();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyDown, handleKeyUp, handleClick, focusedNode]);

  const nodeCanvasObject = (node, ctx) => {
    const label = node.name;

    const nodeSize = 20;

    const fontSize = focusedNode && node.id === focusedNode.id ? 1.35 : 2;
    ctx.font = `${fontSize}px Arial`;

    const wrapAndTruncateText = (text, maxWidth, maxHeight) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < 18) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);

      while (lines.length * fontSize > maxHeight) {
        if (lines.length === 1) {
          lines[0] = truncateText(lines[0], maxWidth);
          break;
        } else {
          lines.pop();
        }
      }

      return lines;
    };

    const wrappedAndTruncatedText = wrapAndTruncateText(
      `${label} ${
        focusedNode && node.id === focusedNode.id && conceptData && conceptData[0]?.thesis
          ? '- ' + conceptData[0]?.thesis
          : ''
      }`,
      label,
      nodeSize,
    );

    const drawTextWithOutline = (
      text: string,
      x: number,
      y: number,
      fillColor: string,
      outlineColor: string,
    ) => {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = focusedNode && node.id === focusedNode.id ? 0.05 : 0.4;
      ctx.strokeText(text, x, y);

      ctx.fillStyle = fillColor;
      ctx.fillText(text, x, y);
    };

    const nodeColor = 'rgba(255, 255, 255, 0.95)';

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize / 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = nodeColor;
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'center';
    wrappedAndTruncatedText.forEach((line, i) => {
      const textY = node.y - (fontSize * (wrappedAndTruncatedText.length - 1)) / 2 + i * fontSize;
      drawTextWithOutline(line, node.x, textY, 'black', nodeColor);
    });

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize / 2, 0, 2 * Math.PI, false);
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.lineWidth = 0.1;
    ctx.stroke();

    if (focusedNode && node.id === focusedNode.id) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize / 2 + 0.75, 0, 2 * Math.PI, false);
      ctx.strokeStyle = 'rgba(255, 252, 0, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const countChildNodes = (nodeId) => {
      const countUsingIds = data.links.filter(
        (link) =>
          link.source.id === nodeId ||
          link.source === nodeId ||
          link.target.id === nodeId ||
          link.target === nodeId,
      ).length;

      return countUsingIds;
    };

    const childNodeCount = countChildNodes(node.id);

    if (childNodeCount > 1) {
      const circleRadius = 3;
      const circleX = node.x + nodeSize / 3;
      const circleY = node.y - nodeSize / 3;

      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(124,0,255, 0.8)';
      ctx.fill();

      ctx.font = `3px Trebuchet MS`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.fillText(childNodeCount, circleX, circleY);
    }
  };

  const linkColorFunction = () => 'rgba(255, 255, 255, 0.8)';
  const backgroundColor = '#0E0417';

  return (
    <div className="graph-container">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        onNodeClick={handleClick}
        backgroundColor={backgroundColor}
        nodeCanvasObject={nodeCanvasObject}
        linkColor={linkColorFunction}
        linkWidth={1}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={0.33}
      />
    </div>
  );
};

export default GraphComponent;
