function normalize(val, max, min) {
  return (val - min) / (max - min);
}

function normalizeVal(val, max, min) {
  return 0.01 + (val - min) / (max - min);
}

function insert(children = [], data, acc) {
  let head = data.group[0];
  let tail = data.group.slice(1);
  let child = children.find((child) => child.name === head);
  if (!child && tail.length > 0) {
    children.push(
      (child = { name: head, children: [], path: acc + "/" + head })
    );
  } else if (!child) {
    children.push(
      (child = {
        name: head,
        value: data.value,
        color: data.color,
        metrics: data.metrics,
        path: acc + "/" + head,
      })
    );
  }

  data.group = tail;

  if (tail.length > 0) insert(child.children, data, acc + "/" + head);

  return children;
}

function parse_paths(data) {
  const ret = data.map((d) => {
    return {
      group: d.group.split("/"),
      value: d.value,
      color: d.color,
      metrics: d.metrics,
    };
  });

  const ret2 = ret.reduce((children, path) => insert(children, path, ""), []);

  return { name: "root", children: ret2 };
}

export { normalize, parse_paths, normalizeVal };
