use oxc_ast::ast::{Statement, Declaration};
use oxc_semantic::SemanticBuilder;
use serde::Serialize;
use crate::complexity::ComplexityCalculator;

#[derive(Serialize, Debug, Clone)]
pub struct Symbol {
    pub name: String,
    pub kind: String,
    pub references: usize,
    pub cyclomatic: usize,
    pub cognitive: usize,
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
    let semantic_ret = SemanticBuilder::new().build(program);
    let semantic = semantic_ret.semantic;
    let scoping = semantic.scoping();
    
    let mut symbols = Vec::new();
    for symbol_id in scoping.symbol_ids() {
        let name = scoping.symbol_name(symbol_id).to_string();
        let flags = scoping.symbol_flags(symbol_id);
        
        let kind = if flags.is_function() { "function" }
                  else if flags.is_class() { "class" }
                  else if flags.is_variable() { "variable" }
                  else { "other" };

        let references = scoping.get_resolved_references(symbol_id).count();
        
        if kind != "other" {
            // Get symbol source range for complexity calculation
            let span = scoping.symbol_span(symbol_id);
            let symbol_code = &source_text[span.start as usize..span.end as usize];
            
            let cyclomatic = ComplexityCalculator::calculate_cyclomatic(symbol_code);
            let cognitive = ComplexityCalculator::calculate_cognitive(symbol_code);

            symbols.push(Symbol { 
                name, 
                kind: kind.to_string(), 
                references,
                cyclomatic,
                cognitive,
            });
        }
    }

    // 2. AST Traversal for Metadata
    // In oxc 0.110.0, Statement variants include Import/Export declarations directly
    for item in &program.body {
        match item {
            Statement::ImportDeclaration(import_decl) => {
                imports.push(import_decl.source.to_string());
            }
            Statement::ExportNamedDeclaration(export_decl) => {
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
            Statement::ExportDefaultDeclaration(_) => {
                exports.push("default".to_string());
            }
            Statement::ExportAllDeclaration(export_all) => {
                exports.push(format!("all_from_{}", export_all.source));
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
