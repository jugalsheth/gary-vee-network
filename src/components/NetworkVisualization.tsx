'use client'

import * as React from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Users, 
  Network, 
  Target,
  Search
} from 'lucide-react'
import type { Contact, ConnectionStrength } from '@/lib/types'
import type { NetworkNode, NetworkEdge } from '@/lib/networkAnalysis'
import { buildNetworkGraph, findShortestPath, generateIntroductionPaths } from '@/lib/networkAnalysis'
import { getTierColor, getTierBadge } from '@/lib/constants'

interface NetworkVisualizationProps {
  contacts: Contact[]
  onContactSelect?: (contact: Contact) => void
  selectedContactId?: string
}

interface NodeData extends d3.SimulationNodeDatum {
  id: string
  contact: Contact
  degree: number
  isHub: boolean
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: string
  target: string
  strength: ConnectionStrength
  type: string
  bidirectional: boolean
}

export function NetworkVisualization({ 
  contacts, 
  onContactSelect, 
  selectedContactId 
}: NetworkVisualizationProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [networkData, setNetworkData] = React.useState<{ nodes: NetworkNode[]; edges: NetworkEdge[] }>({ nodes: [], edges: [] })
  const [selectedPath, setSelectedPath] = React.useState<string[]>([])
  const [pathSource, setPathSource] = React.useState<string>('')
  const [pathTarget, setPathTarget] = React.useState<string>('')
  const [introductionPaths, setIntroductionPaths] = React.useState<any[]>([])
  const [zoom, setZoom] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)

  // Filter out duplicate contacts to prevent key conflicts
  const uniqueContacts = React.useMemo(() => {
    const seen = new Set<string>()
    return contacts.filter(contact => {
      if (seen.has(contact.id)) {
        return false
      }
      seen.add(contact.id)
      return true
    })
  }, [contacts])

  // Build network data when contacts change
  React.useEffect(() => {
    if (uniqueContacts.length > 0) {
      const data = buildNetworkGraph(uniqueContacts)
      setNetworkData(data)
    }
  }, [uniqueContacts])

  // D3 visualization
  React.useEffect(() => {
    if (!svgRef.current || !containerRef.current || networkData.nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Clear previous visualization
    svg.selectAll('*').remove()

    // Create zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        setZoom(event.transform.k)
        svg.select('.network-group').attr('transform', event.transform)
      })

    svg.call(zoomBehavior)

    // Create main group for network
    const g = svg.append('g').attr('class', 'network-group')

    // Prepare data for D3
    const nodes: NodeData[] = networkData.nodes.map(node => ({
      id: node.id,
      contact: node.contact,
      degree: node.degree,
      isHub: node.isHub
    }))

    const links: LinkData[] = networkData.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      strength: edge.strength,
      type: edge.type,
      bidirectional: edge.bidirectional
    }))

    // Create force simulation
    const simulation = d3.forceSimulation<NodeData>(nodes)
      .force('link', d3.forceLink<NodeData, LinkData>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => getLinkColor(d.strength))
      .attr('stroke-width', d => getLinkWidth(d.strength))
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', d => `url(#arrow-${d.strength})`)

    // Create arrow markers
    const defs = svg.append('defs')
    ;['strong', 'medium', 'weak'].forEach(strength => {
      defs.append('marker')
        .attr('id', `arrow-${strength}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', getLinkColor(strength as ConnectionStrength))
    })

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGCircleElement, NodeData>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => getNodeRadius(d.degree, d.isHub))
      .attr('fill', d => getNodeColor(d.contact.tier))
      .attr('stroke', d => selectedContactId === d.id ? '#000' : '#fff')
      .attr('stroke-width', d => selectedContactId === d.id ? 3 : 2)
      .attr('stroke-opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        onContactSelect?.(d.contact)
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-width', 4)
        showTooltip(event, d)
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('stroke-width', selectedContactId === d.id ? 3 : 2)
        hideTooltip()
      })

    // Add labels to nodes
    node.append('text')
      .text(d => d.contact.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .style('pointer-events', 'none')

    // Add hub indicator
    node.filter(d => d.isHub)
      .append('circle')
      .attr('r', 8)
      .attr('fill', '#ffd700')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('transform', 'translate(0, -25)')

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeData).x)
        .attr('y1', d => (d.source as NodeData).y)
        .attr('x2', d => (d.target as NodeData).x)
        .attr('y2', d => (d.target as NodeData).y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(this: SVGCircleElement, event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(this: SVGCircleElement, event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(this: SVGCircleElement, event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Tooltip functions
    function showTooltip(event: d3.D3PointerEvent<SVGCircleElement, NodeData>, d: NodeData) {
      const tooltip = d3.select('body').append('div')
        .attr('class', 'network-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')

      tooltip.html(`
        <strong>${d.contact.name}</strong><br/>
        Tier: ${d.contact.tier}<br/>
        Connections: ${d.degree}<br/>
        ${d.contact.location ? `Location: ${d.contact.location}<br/>` : ''}
        ${d.contact.relationshipToGary}
      `)

      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
    }

    function hideTooltip() {
      d3.selectAll('.network-tooltip').remove()
    }

    // Cleanup
    return () => {
      simulation.stop()
      d3.selectAll('.network-tooltip').remove()
    }
  }, [networkData, selectedContactId, onContactSelect])

  // Handle path finding
  const handleFindPath = React.useCallback(() => {
    if (!pathSource || !pathTarget) return

    setIsLoading(true)
    try {
      const paths = generateIntroductionPaths(contacts, pathSource, pathTarget)
      setIntroductionPaths(paths)
      setSelectedPath(paths[0]?.path.map(c => c.id) || [])
    } catch (error) {
      console.error('Error finding path:', error)
    } finally {
      setIsLoading(false)
    }
  }, [contacts, pathSource, pathTarget])

  // Handle zoom controls
  const handleZoomIn = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.5
      )
    }
  }

  const handleZoomOut = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy, 1 / 1.5
      )
    }
  }

  const handleReset = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().call(
        d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity
      )
    }
  }

  // Helper functions
  const getNodeColor = (tier: string) => {
    switch (tier) {
      case 'tier1': return '#ec4899' // Pink
      case 'tier2': return '#eab308' // Yellow
      case 'tier3': return '#22c55e' // Green
      default: return '#6b7280' // Gray
    }
  }

  const getNodeRadius = (degree: number, isHub: boolean) => {
    if (isHub) return 25
    return Math.max(15, Math.min(25, 15 + degree * 2))
  }

  const getLinkColor = (strength: ConnectionStrength) => {
    switch (strength) {
      case 'strong': return '#dc2626' // Red
      case 'medium': return '#f59e0b' // Orange
      case 'weak': return '#6b7280' // Gray
      default: return '#6b7280'
    }
  }

  const getLinkWidth = (strength: ConnectionStrength) => {
    switch (strength) {
      case 'strong': return 3
      case 'medium': return 2
      case 'weak': return 1
      default: return 1
    }
  }

  if (contacts.length === 0) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Network className="w-12 h-12 mx-auto mb-4" />
          <p>No contacts to visualize</p>
          <p className="text-sm">Add some contacts to see the network</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-xs">Tier 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs">Tier 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Tier 3</span>
          </div>
        </div>
      </div>

      {/* Network Visualization */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Network Visualization
            <Badge variant="outline">{networkData.nodes.length} contacts</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={containerRef} 
            className="w-full h-96 border rounded-lg relative"
          >
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              style={{ cursor: 'grab' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Path Finding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Find Introduction Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">From</label>
              <Select value={pathSource} onValueChange={setPathSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source contact" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueContacts.map((contact, index) => (
                    <SelectItem key={`source-${contact.id}-${index}`} value={contact.id}>
                      {contact.name} ({contact.tier})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">To</label>
              <Select value={pathTarget} onValueChange={setPathTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target contact" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueContacts.map((contact, index) => (
                    <SelectItem key={`target-${contact.id}-${index}`} value={contact.id}>
                      {contact.name} ({contact.tier})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleFindPath} 
              disabled={!pathSource || !pathTarget || isLoading}
              className="mt-6"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Finding...' : 'Find Path'}
            </Button>
          </div>

          {/* Introduction Paths */}
          {introductionPaths.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Introduction Paths:</h4>
              {introductionPaths.slice(0, 3).map((path, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Path {index + 1}</span>
                    <Badge variant="outline">
                      {path.totalSteps} steps, Strength: {path.strength}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {path.notes.join(' → ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 