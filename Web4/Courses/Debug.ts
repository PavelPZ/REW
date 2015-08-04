module courseDebug {
  export function run() {
    $.getJSON('page.json', data => $("#result").html($("#c_gen").render(data))); 
  }
}
