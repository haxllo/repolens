"""
Tests for the dead_code module.
"""

import pytest
from src.analysis.dead_code import (
    DeadCodeDetector,
    ASTSymbolExtractor,
    analyze_dead_code,
    analyze_dead_code_from_files,
)


class TestDeadCodeDetector:
    """Tests for DeadCodeDetector class."""
    
    def test_find_unused_exports_basic(self):
        """Test basic unused export detection."""
        exports = {
            'utils.js': ['helper', 'unused_func', 'another_unused'],
            'main.js': ['main'],
        }
        imports = {
            'app.js': {'helper': 'utils.js', 'main': 'main.js'},
        }
        
        detector = DeadCodeDetector(exports, imports)
        unused = detector.find_unused_exports()
        
        assert 'utils.js' in unused
        assert 'unused_func' in unused['utils.js']
        assert 'another_unused' in unused['utils.js']
        assert 'helper' not in unused.get('utils.js', [])
    
    def test_find_unused_exports_all_used(self):
        """Test when all exports are used."""
        exports = {
            'utils.js': ['helper', 'other'],
        }
        imports = {
            'app.js': {'helper': 'utils.js'},
            'main.js': {'other': 'utils.js'},
        }
        
        detector = DeadCodeDetector(exports, imports)
        unused = detector.find_unused_exports()
        
        assert 'utils.js' not in unused or len(unused.get('utils.js', [])) == 0
    
    def test_find_unused_imports_basic(self):
        """Test basic unused import detection."""
        exports = {}
        imports = {
            'app.js': {'useState': 'react', 'unused_hook': 'react'},
        }
        symbol_usages = {
            'app.js': {'useState', 'Component', 'render'},
        }
        
        detector = DeadCodeDetector(exports, imports, symbol_usages)
        unused = detector.find_unused_imports()
        
        assert 'app.js' in unused
        unused_symbols = [u['symbol'] for u in unused['app.js']]
        assert 'unused_hook' in unused_symbols
        assert 'useState' not in unused_symbols
    
    def test_get_analysis_statistics(self):
        """Test that analysis returns correct statistics."""
        exports = {
            'utils.js': ['a', 'b', 'c', 'd'],  # 4 exports
        }
        imports = {
            'app.js': {'a': 'utils.js'},  # Only 'a' is imported
        }
        
        detector = DeadCodeDetector(exports, imports)
        analysis = detector.get_analysis()
        
        assert analysis['has_dead_code'] is True
        assert analysis['statistics']['total_exports'] == 4
        assert analysis['statistics']['total_unused_exports'] == 3
        assert analysis['statistics']['unused_export_percentage'] == 75.0
    
    def test_risk_score_calculation(self):
        """Test risk score is calculated correctly."""
        detector = DeadCodeDetector({}, {})
        
        # 0% unused = 0 risk
        assert detector._calculate_risk_score(0, 100) == 0
        
        # 5% unused = 20 risk
        assert detector._calculate_risk_score(5, 100) == 20
        
        # 15% unused = 40 risk
        assert detector._calculate_risk_score(15, 100) == 40
        
        # 35% unused = 60 risk
        assert detector._calculate_risk_score(35, 100) == 60
        
        # 60% unused = 80 risk
        assert detector._calculate_risk_score(60, 100) == 80


class TestASTSymbolExtractor:
    """Tests for ASTSymbolExtractor class."""
    
    def test_extract_js_exports(self):
        """Test JavaScript/TypeScript export extraction."""
        extractor = ASTSymbolExtractor()
        
        js_content = '''
        export const helper = () => {};
        export function doSomething() {}
        export class MyClass {}
        export { foo, bar as baz };
        export default MainComponent;
        '''
        
        exports, imports, usages = extractor._extract_js_ts_symbols(js_content, 'test.js')
        
        assert 'helper' in exports
        assert 'doSomething' in exports
        assert 'MyClass' in exports
        assert 'foo' in exports
        assert 'MainComponent' in exports
    
    def test_extract_js_imports(self):
        """Test JavaScript/TypeScript import extraction."""
        extractor = ASTSymbolExtractor()
        
        js_content = '''
        import React from 'react';
        import { useState, useEffect } from 'react';
        import * as utils from './utils';
        const { helper } = require('./helper');
        '''
        
        exports, imports, usages = extractor._extract_js_ts_symbols(js_content, 'test.js')
        
        assert 'React' in imports
        assert imports['React'] == 'react'
        assert 'useState' in imports
        assert 'useEffect' in imports
        assert 'utils' in imports
        assert 'helper' in imports
    
    def test_extract_python_exports(self):
        """Test Python export extraction via __all__."""
        extractor = ASTSymbolExtractor()
        
        py_content = '''
        __all__ = ['public_func', 'PublicClass']
        
        def public_func():
            pass
        
        def _private_func():
            pass
        
        class PublicClass:
            pass
        '''
        
        exports, imports, usages = extractor._extract_python_symbols(py_content, 'test.py')
        
        assert 'public_func' in exports
        assert 'PublicClass' in exports
    
    def test_extract_python_imports(self):
        """Test Python import extraction."""
        extractor = ASTSymbolExtractor()
        
        py_content = '''from typing import Dict, List
import os
import json as j
from pathlib import Path
'''
        
        exports, imports, usages = extractor._extract_python_symbols(py_content, 'test.py')
        
        assert 'Dict' in imports
        assert 'List' in imports
        assert 'os' in imports
        assert 'j' in imports
        assert 'Path' in imports


class TestAnalyzeDeadCode:
    """Tests for the analyze_dead_code function."""
    
    def test_analyze_dead_code_basic(self):
        """Test the convenience function."""
        exports = {'lib.js': ['used', 'unused']}
        imports = {'app.js': {'used': 'lib.js'}}
        
        result = analyze_dead_code(exports, imports)
        
        assert 'has_dead_code' in result
        assert 'unused_exports' in result
        assert 'statistics' in result
        assert result['has_dead_code'] is True
    
    def test_analyze_dead_code_handles_errors(self):
        """Test that errors are handled gracefully."""
        # Pass invalid data that might cause issues
        result = analyze_dead_code(None, None)
        
        # Should return error result, not crash
        assert 'error' in result or result.get('has_dead_code') is False


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
