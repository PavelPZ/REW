/// <reference path="components.ts" />

<Body><div>{$loc('a', 'b') }xxx yyy zzz{3}{false}{new Date() }</div></Body>
namespace courseTest {

  export function doRunApp() {
    //return <Body><div>{$loc('a', 'b') }xxx yyy zzz{3}{false}{new Date() }</div></Body>;
    //React.createElement(Body, null, $loc('a', 'b'), "xxx yyy zzz", 3, false, new Date());
    //React.createElement(Body, null, $loc('a', 'b'), "xxx yyy zzz", 2, false);
  }
}