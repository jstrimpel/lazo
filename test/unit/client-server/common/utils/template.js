define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'utils/template'
], function (bdd, chai, expect, sinon, sinonChai, utils, template) {
    chai.use(sinonChai);

    with (bdd) {
        describe('template', function () {

            beforeEach(function () {
                // clean up any changes to structure in module closure
                template.setDefaultTemplateEngine('micro');
                template.setTemplateExt('micro', 'mt');
            });

            function registerTemplateEngine() {
                template.registerTemplateEngine('nunjucks', 'nj', {
                    compile: function () { return 'compile'; },
                    execute: function () { return 'execute'; }
                });
            }

            it('should get the default template engine extension', function () {
                expect(template.getDefaultExt('micro')).to.be.equal('mt');
            });

            it('should get the default template engine extension', function () {
                template.setTemplateExt('micro', 'foo');
                expect(template.getTemplateExt('micro')).to.be.equal('foo');
            });

            it('should register a template engine', function () {
                var nunjucks;
                var def;

                registerTemplateEngine();
                nunjucks = template.getTemplateEngine('nunjucks');
                expect(nunjucks.compile()).to.be.equal('compile');
                expect(nunjucks.execute()).to.be.equal('execute');
                expect(template.getTemplateExt('nunjucks')).to.be.equal('nj');

                def = template.getTemplateEngineDef('nunjucks');
                expect(def).to.have.property('handler');
            });

            it('should get a template engine', function () {
                var engine = template.getTemplateEngine('micro');
                expect(engine.engine).to.be.Function;
            });

            it('should get the template engine extension', function () {
                expect(template.getTemplateExt('micro')).to.be.equal('mt');
            });

            it('should get the template engine definition', function () {
                var def = template.getTemplateEngineDef('micro');
                expect(def.extension).to.be.equal('mt');
                expect(def).to.have.property('handler');
            });

            it('should get the default template engine', function () {
                var engine = template.getDefaultTemplateEngine();
                expect(engine.engine).to.be.Function;
            });

            it('should get the default template engine name', function () {
                expect(template.getDefaultTemplateEngineName()).to.be.equal('micro');
            });

            it('should set the default template engine', function () {
                registerTemplateEngine();
                template.setDefaultTemplateEngine('nunjucks');
                expect(template.getDefaultTemplateEngineName()).to.be.equal('nunjucks');
            });

        });
    }
});