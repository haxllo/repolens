mod analyzer;

use std::path::{Path, PathBuf};
use std::fs;
use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rayon::prelude::*;
use serde::Serialize;
use walkdir::WalkDir;
use clap::Parser as ClapParser;
use analyzer::analyze_program;

#[derive(ClapParser, Debug)]
#[command(author, version, about = "High-performance architectural scanner for RepoLens")]
struct Args {
    #[arg(short, long)]
    path: String,
}

#[derive(Serialize, Debug, Default)]
struct FileResult {
    path: String,
    functions: usize,
    classes: usize,
    imports: Vec<String>,
    exports: Vec<String>,
    symbols: Vec<analyzer::Symbol>,
    lines: usize,
    error: Option<String>,
}

#[derive(Serialize, Debug)]
struct ScanResult {
    files: Vec<FileResult>,
    total_files: usize,
    execution_mode: String,
}

fn main() -> anyhow::Result<()> {
    let args = Args::parse();
    let root_path = Path::new(&args.path);

    if !root_path.exists() {
        anyhow::bail!("SYSTEM_FAULT: Path does not exist: {}", args.path);
    }

    // 1. Gather all JS/TS files
    let files: Vec<PathBuf> = WalkDir::new(root_path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| {
            let path = e.path();
            if path.is_dir() { return false; }
            let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("");
            matches!(ext, "js" | "jsx" | "ts" | "tsx" | "mjs")
        })
        .map(|e| e.path().to_path_buf())
        .collect();

    // 2. Process in parallel using Rayon (Oxidized Speed)
    let results: Vec<FileResult> = files
        .par_iter()
        .map(|path| process_file(root_path, path))
        .collect();

    let scan_result = ScanResult {
        total_files: results.len(),
        files: results,
        execution_mode: "OXIDIZED_NATIVE".to_string(),
    };

    // 3. Output JSON for the Python Orchestrator
    println!("{}", serde_json::to_string_pretty(&scan_result)?);

    Ok(())
}

fn process_file(root: &Path, path: &Path) -> FileResult {
    let rel_path = path.strip_prefix(root).unwrap_or(path).to_string_lossy().into_owned();
    
    let source = match fs::read_to_string(path) {
        Ok(s) => s,
        Err(e) => return FileResult { path: rel_path, error: Some(e.to_string()), ..Default::default() }
    };

    let lines = source.lines().count();
    let allocator = Allocator::default();
    let source_type = SourceType::from_path(path).unwrap_or_default();
    
    let parser = Parser::new(&allocator, &source, source_type);
    let ret = parser.parse();

    if !ret.errors.is_empty() {
        return FileResult { 
            path: rel_path, 
            lines,
            error: Some(format!("Parse failed with {} errors", ret.errors.len())), 
            ..Default::default() 
        };
    }

    let analysis = analyze_program(&ret.program, &source);

    FileResult {
        path: rel_path,
        functions: analysis.functions,
        classes: analysis.classes,
        imports: analysis.imports,
        exports: analysis.exports,
        symbols: analysis.symbols,
        lines,
        error: None,
    }
}