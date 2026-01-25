use std::collections::{HashMap, HashSet};
use serde::Serialize;

#[derive(Serialize, Debug, Default)]
pub struct Cycle {
    pub chain: Vec<String>,
    pub length: usize,
}

pub struct DependencyGraph {
    // Map of file path -> list of absolute imported file paths
    adj_list: HashMap<String, Vec<String>>,
}

impl DependencyGraph {
    pub fn new(files: &Vec<crate::FileResult>) -> Self {
        let mut adj_list = HashMap::new();
        
        // Map of "import specifier" to actual "file path" would require resolution logic.
        // For "Full Oxidization", we start with exact matches and path-relative resolution.
        for file in files {
            adj_list.insert(file.path.clone(), file.imports.clone());
        }

        Self { adj_list }
    }

    pub fn detect_cycles(&self) -> Vec<Cycle> {
        let mut cycles = Vec::new();
        let mut visited = HashSet::new();
        let mut stack = Vec::new();
        let mut on_stack = HashSet::new();

        for node in self.adj_list.keys() {
            if !visited.contains(node) {
                self.dfs(node, &mut visited, &mut stack, &mut on_stack, &mut cycles);
            }
        }

        cycles
    }

    fn dfs(
        &self,
        node: &String,
        visited: &mut HashSet<String>,
        stack: &mut Vec<String>,
        on_stack: &mut HashSet<String>,
        cycles: &mut Vec<Cycle>,
    ) {
        visited.insert(node.clone());
        on_stack.insert(node.clone());
        stack.push(node.clone());

        if let Some(neighbors) = self.adj_list.get(node) {
            for neighbor in neighbors {
                // Heuristic resolution: Check if neighbor is a relative path or an exact match in our nodes
                // In a real SCIP implementation, we would use the symbol table.
                if self.adj_list.contains_key(neighbor) {
                    if on_stack.contains(neighbor) {
                        // Found a cycle!
                        let start_index = stack.iter().position(|x| x == neighbor).unwrap();
                        let mut chain: Vec<String> = stack[start_index..].to_vec();
                        chain.push(neighbor.clone());
                        cycles.push(Cycle {
                            length: chain.len() - 1,
                            chain,
                        });
                    } else if !visited.contains(neighbor) {
                        self.dfs(neighbor, visited, stack, on_stack, cycles);
                    }
                }
            }
        }

        on_stack.remove(node);
        stack.pop();
    }
}
