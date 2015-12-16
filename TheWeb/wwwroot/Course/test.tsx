<div>{$loc('a', 'b') }xxx yyy zzz{3}{false}{new Date() }</div>
function a() {
  React.createElement(Body, null, $loc('a', 'b'), "xxx yyy zzz", 3, false, new Date());
  React.createElement(Body, null, $loc('a', 'b'), "xxx yyy zzz", 2, false);
}