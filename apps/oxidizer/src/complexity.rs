use regex::Regex;
use std::sync::OnceLock;

pub struct ComplexityCalculator;

static CYCLOMATIC_PATTERNS: OnceLock<Vec<Regex>> = OnceLock::new();
static COGNITIVE_PATTERNS: OnceLock<Vec<(Regex, i32)>> = OnceLock::new();

impl ComplexityCalculator {
    fn get_cyclomatic_patterns() -> &'static Vec<Regex> {
        CYCLOMATIC_PATTERNS.get_or_init(|| {
            vec![
                Regex::new(r"\bif\b").unwrap(),
                Regex::new(r"\belse\s+if\b").unwrap(),
                Regex::new(r"\bfor\b").unwrap(),
                Regex::new(r"\bwhile\b").unwrap(),
                Regex::new(r"\bdo\b").unwrap(),
                Regex::new(r"\bcase\b").unwrap(),
                Regex::new(r"\bcatch\b").unwrap(),
                Regex::new(r"\?").unwrap(),
                Regex::new(r"&&").unwrap(),
                Regex::new(r"\|\|").unwrap(),
                Regex::new(r"\?\?").unwrap(),
            ]
        })
    }

    fn get_cognitive_patterns() -> &'static Vec<(Regex, i32)> {
        COGNITIVE_PATTERNS.get_or_init(|| {
            vec![
                (Regex::new(r"\bif\b").unwrap(), 1),
                (Regex::new(r"\belse\s+if\b").unwrap(), 1),
                (Regex::new(r"\belse\b").unwrap(), 1),
                (Regex::new(r"\bfor\b").unwrap(), 1),
                (Regex::new(r"\bwhile\b").unwrap(), 1),
                (Regex::new(r"\bdo\b").unwrap(), 1),
                (Regex::new(r"\bswitch\b").unwrap(), 1),
                (Regex::new(r"\bcatch\b").unwrap(), 1),
                (Regex::new(r"\btry\b").unwrap(), 0),
                (Regex::new(r"&&").unwrap(), 1),
                (Regex::new(r"\|\|").unwrap(), 1),
                (Regex::new(r"=>\s*\{").unwrap(), 1),
            ]
        })
    }

    pub fn calculate_cyclomatic(code: &str) -> usize {
        let mut complexity = 1;
        for pattern in Self::get_cyclomatic_patterns() {
            complexity += pattern.find_iter(code).count();
        }
        complexity
    }

    pub fn calculate_cognitive(code: &str) -> usize {
        let mut complexity = 0;
        let mut nesting_level = 0;
        let patterns = Self::get_cognitive_patterns();

        for line in code.lines() {
            let stripped = line.trim();
            if stripped.is_empty() {
                continue;
            }

            // Update nesting based on braces
            let open_braces = line.chars().filter(|&c| c == '{').count() as i32;
            let close_braces = line.chars().filter(|&c| c == '}').count() as i32;
            
            // Check for complexity-increasing patterns before increasing nesting
            for (pattern, base_increment) in patterns {
                if pattern.is_match(stripped) {
                    complexity += base_increment + if *base_increment > 0 { nesting_level } else { 0 };
                }
            }

            nesting_level = (nesting_level + open_braces - close_braces).max(0);
        }
        complexity as usize
    }
}
