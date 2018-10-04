let vermon = require("./vermon");
let logger = vermon.logger;
let chai = require('chai');
let should = chai.should();

let errors = require('../../Errors');

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

describe("Basic new syntax, ", function() {
  xit('watch (replacer for former StartWithConfig)', function () {
    vermon.watch((environment, detectors)=>{
	  logger.info(`Watching environment ${environment.name}, currently detecting:`);
	  for(let d in detectors){
		logger.info(d.name);
	  }
	});
  });
  
  xit('watch: No longer requires config as first argument', function () {
    vermon.watch((environment, detectors)=>{
	  logger.info(`Watching environment ${environment.name}, currently detecting:`);
	  for(let d in detectors){
		logger.info(d.name);
	  }
	});
  });

  it('watch: returns an error promise if error happens', function (done) {
    vermon.watch().then((environment, detectors)=>{
	  console.log(`Watching environment ${environment.name}, currently detecting:`);
	}).catch((e)=>{
	  console.error(`Some error happened: ${e}`);
	  e.name.should.equal("MissingConfigError");
	  done();
	});
  });
})