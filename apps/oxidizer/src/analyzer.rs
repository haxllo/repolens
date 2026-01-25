use oxc_ast::ast::{Statement, ModuleDeclaration, Declaration};
use oxc_ast::AstKind;
use oxc_ast::ast::ExportDeclaration;

pub struct AnalysisResult {
    pub functions: usize,
    pub classes: usize,
    pub imports: Vec<String>,
    pub exports: Vec<String>,
}

pub fn analyze_program(program: &oxc_ast::ast::Program) -> AnalysisResult {
    let mut functions = 0;
    let mut classes = 0;
    let mut imports = Vec::new();
    let mut exports = Vec::new();

    for item in &program.body {
        match item {
            Statement::ModuleDeclaration(module_decl) => {
                match &**module_decl {
                    ModuleDeclaration::ImportDeclaration(import_decl) => {
                        imports.push(import_decl.source.to_string());
                    }
                    ModuleDeclaration::ExportNamedDeclaration(export_decl) => {
                        if let Some(decl) = &export_decl.declaration {
                            match decl {
                                Declaration::FunctionDeclaration(_) => {
                                    functions += 1;
                                    exports.push("function".to_string());
                                }
                                Declaration::ClassDeclaration(_) => {
                                    classes += 1;
                                    exports.push("class".to_string());
                                }
                                _ => {}
                            }
                        }
                    }
                    ModuleDeclaration::ExportDefaultDeclaration(_) => {
                        exports.push("default".to_string());
                    }
                    ModuleDeclaration::ExportAllDeclaration(export_all) => {
                        exports.push(format!("all_from_{}", export_all.source));
                    }
                    _ => {}
                }
            }
            Statement::FunctionDeclaration(_) => functions += 1,
            Statement::ClassDeclaration(_) => classes += 1,
            _ => {}
        }
    }

    AnalysisResult {
        functions,
        classes,
        imports,
        exports,
    }
}
