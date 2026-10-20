// Generates public/og.png (1200x630 social preview) from an inline SVG. Run: npm run og
import sharp from 'sharp';
const nodes = [[880,120],[1010,200],[940,320],[1090,360],[820,430],[1000,500],[1120,150],[760,250]];
const edges = [[0,1],[1,2],[2,3],[2,4],[4,5],[1,6],[0,7],[7,2],[5,3]];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#080b0e"/>
<defs><pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="#62c8ff" stroke-opacity="0.07"/></pattern></defs>
<rect width="1200" height="630" fill="url(#g)"/>
${edges.map(([a,b])=>`<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" stroke="#62c8ff" stroke-opacity="0.3"/>`).join('')}
${nodes.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%3===0?9:5}" fill="${i%3===0?'#3be8bd':'#62c8ff'}"/>`).join('')}
<text x="80" y="170" font-family="Consolas, monospace" font-size="26" fill="#3be8bd">Cybersecurity · Networking · Software Engineering</text>
<text x="80" y="300" font-family="Arial, sans-serif" font-weight="700" font-size="92" fill="#e8eff2">Zakariyae</text>
<text x="80" y="400" font-family="Arial, sans-serif" font-weight="700" font-size="92" fill="#e8eff2">Bouhout</text>
<text x="80" y="480" font-family="Arial, sans-serif" font-size="34" fill="#8fa0a9">Securing Systems. Building Solutions.</text>
<text x="80" y="560" font-family="Consolas, monospace" font-size="24" fill="#5d6e77">ztheh.github.io</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('public/og.png written');
