import{r as o,u,a as l,j as e}from"./index-DUtn00mt.js";import{D as r,S as d}from"./index-DJijz5KX.js";function f(){const[n,c]=o.useState(0),{destroy:i}=u(),s=o.useRef(null);return l(t=>(console.log(`Counter active: ${t} Count: ${n}`),()=>{console.log(`Counter cleanup: ${t} Count: ${n}`)}),!0,[n]),o.useEffect(()=>{const t=s.current;t&&console.log(`div height: ${t.clientHeight} width: ${t.clientWidth}`)},[]),e.jsxs("div",{ref:s,children:[e.jsxs("p",{children:["Count: ",n]}),e.jsx("button",{onClick:()=>c(n+1),children:"Increment"}),e.jsx("input",{type:"text"}),e.jsxs("div",{children:[e.jsx(r,{}),e.jsx(r.RangePicker,{}),e.jsx(d,{style:{width:120}})]}),e.jsx("button",{onClick:()=>i(),children:"destroy"})]})}export{f as default};
