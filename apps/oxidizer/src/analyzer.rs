use oxc_ast::ast::{Statement, ModuleDeclaration, Declaration};
use oxc_semantic::{SemanticBuilder, SymbolId};
use serde::Serialize;

#[derive(Serialize, Debug, Clone)]
pub struct Symbol {
    pub name: String,
    pub kind: String,
    pub references: usize,
}

pub struct AnalysisResult {
    pub functions: usize,
    pub classes: usize,
    pub imports: Vec<String>,
    pub exports: Vec<String>,
    pub symbols: Vec<Symbol>,
}

pub fn analyze_program(program: &oxc_ast::ast::Program, source_text: &str) -> AnalysisResult {
    let mut functions = 0;
    let mut classes = 0;
    let mut imports = Vec::new();
    let mut exports = Vec::new();

    // 1. Semantic Analysis (SCIP Lite)
    let semantic_ret = SemanticBuilder::new(source_text).build(program);
    let semantic = semantic_ret.semantic;
    let symbols_table = semantic.symbols();
    
    let mut symbols = Vec::new();
    for symbol_id in symbols_table.symbol_ids() {
        let name = symbols_table.get_name(symbol_id).to_string();
        let flags = symbols_table.get_flags(symbol_id);
        
        let kind = if flags.is_function() { "function" }
                  else if flags.is_class() { "class" }
                  else if flags.is_variable() { "variable" }
                  else { "other" };

        let references = semantic.symbol_references(symbol_id).count();
        
        // Only track significant top-level-ish symbols for now
        if kind != "other" {
            symbols.push(Symbol { name, kind: kind.to_string(), references });
        }
    }

    // 2. AST Traversal for Metadata
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
        symbols,
    }
}
