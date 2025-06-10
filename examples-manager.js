/**
 * 外置例题库管理器
 * 负责加载、管理和提供例题数据
 */
class ExamplesManager {
    constructor() {
        this.database = null;
        this.isLoaded = false;
        this.loadPromise = null;
    }

    /**
     * 异步加载例题库数据
     */
    async loadDatabase() {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._fetchDatabase();
        return this.loadPromise;
    }

    async _fetchDatabase() {
        try {
            const response = await fetch('./examples-database.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.database = await response.json();
            this.isLoaded = true;
            console.log('例题库加载成功:', this.database.metadata);
            return this.database;
        } catch (error) {
            console.error('例题库加载失败:', error);
            // 返回空的数据库结构，确保程序正常运行
            this.database = {
                metadata: { version: '0.0', description: '加载失败，使用内置例题' },
                categories: {}
            };
            this.isLoaded = false;
            throw error;
        }
    }

    /**
     * 获取指定函数类型的例题列表
     * @param {string} functionType - 函数类型
     * @returns {Array} 例题列表
     */
    getExamplesForFunction(functionType) {
        if (!this.isLoaded || !this.database) {
            return [];
        }

        const category = this.database.categories[functionType];
        return category ? category.examples : [];
    }

    /**
     * 根据ID获取特定例题
     * @param {string} exampleId - 例题ID
     * @returns {Object|null} 例题对象
     */
    getExampleById(exampleId) {
        if (!this.isLoaded || !this.database) {
            return null;
        }

        for (const category of Object.values(this.database.categories)) {
            const example = category.examples.find(ex => ex.id === exampleId);
            if (example) {
                return example;
            }
        }
        return null;
    }

    /**
     * 获取所有可用的函数类型
     * @returns {Array} 函数类型列表
     */
    getAvailableFunctionTypes() {
        if (!this.isLoaded || !this.database) {
            return [];
        }
        return Object.keys(this.database.categories);
    }

    /**
     * 根据难度筛选例题
     * @param {string} functionType - 函数类型
     * @param {string} difficulty - 难度等级
     * @returns {Array} 筛选后的例题列表
     */
    getExamplesByDifficulty(functionType, difficulty) {
        const examples = this.getExamplesForFunction(functionType);
        return examples.filter(example => example.difficulty === difficulty);
    }

    /**
     * 根据标签筛选例题
     * @param {string} functionType - 函数类型
     * @param {string} tag - 标签
     * @returns {Array} 筛选后的例题列表
     */
    getExamplesByTag(functionType, tag) {
        const examples = this.getExamplesForFunction(functionType);
        return examples.filter(example => example.tags.includes(tag));
    }

    /**
     * 获取例题的统计信息
     * @param {string} functionType - 函数类型
     * @returns {Object} 统计信息
     */
    getExamplesStats(functionType) {
        const examples = this.getExamplesForFunction(functionType);
        const stats = {
            total: examples.length,
            byDifficulty: {},
            byType: {},
            allTags: new Set()
        };

        examples.forEach(example => {
            // 按难度统计
            stats.byDifficulty[example.difficulty] = 
                (stats.byDifficulty[example.difficulty] || 0) + 1;
            
            // 按题型统计
            const type = example.question.type;
            stats.byType[type] = (stats.byType[type] || 0) + 1;
            
            // 收集所有标签
            example.tags.forEach(tag => stats.allTags.add(tag));
        });

        stats.allTags = Array.from(stats.allTags);
        return stats;
    }

    /**
     * 搜索例题
     * @param {string} functionType - 函数类型
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 搜索结果
     */
    searchExamples(functionType, keyword) {
        const examples = this.getExamplesForFunction(functionType);
        const lowerKeyword = keyword.toLowerCase();
        
        return examples.filter(example => {
            return example.title.toLowerCase().includes(lowerKeyword) ||
                   example.question.text.toLowerCase().includes(lowerKeyword) ||
                   example.tags.some(tag => tag.toLowerCase().includes(lowerKeyword));
        });
    }

    /**
     * 获取数据库元信息
     * @returns {Object} 元信息
     */
    getMetadata() {
        return this.database ? this.database.metadata : null;
    }

    /**
     * 检查是否已加载
     * @returns {boolean} 是否已加载
     */
    isReady() {
        return this.isLoaded;
    }

    /**
     * 格式化例题内容为HTML
     * @param {Object} example - 例题对象
     * @returns {string} HTML字符串
     */
    formatExampleToHTML(example) {
        if (!example) return '';

        let html = `
            <div class="example-header">
                <div class="example-title">${example.title}</div>
                <div class="example-meta">
                    <span class="difficulty difficulty-${example.difficulty.toLowerCase()}">${example.difficulty}</span>
                    <div class="tags">
                        ${example.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
            
            <div class="example-question">
                <h4>📝 题目</h4>
                <div class="question-content">
                    ${example.question.text.replace(/\n/g, '<br>')}
                </div>
                <div class="question-type">题型：${example.question.type}</div>
            </div>
            
            <div class="example-solution">
                <h4>💡 详细解答</h4>
                <div class="solution-steps">
        `;

        // 添加解题步骤
        example.solution.steps.forEach(step => {
            html += `
                <div class="solution-step">
                    <div class="step-header">
                        <span class="step-number">步骤 ${step.step}</span>
                        <span class="step-title">${step.title}</span>
                    </div>
                    <div class="step-content">${step.content.replace(/\n/g, '<br>')}</div>
                    ${step.formula ? `<div class="step-formula">公式：${step.formula}</div>` : ''}
                </div>
            `;
        });

        html += `
                </div>
                <div class="final-answer">
                    <h5>最终答案：</h5>
                    <div class="answer-content">${example.solution.finalAnswer.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;

        // 添加概念解释
        if (example.concepts && example.concepts.length > 0) {
            html += `
                <div class="example-concepts">
                    <h4>📚 相关概念</h4>
                    <div class="concepts-list">
            `;
            
            example.concepts.forEach(concept => {
                html += `
                    <div class="concept-item">
                        <div class="concept-name">${concept.name}</div>
                        <div class="concept-definition">${concept.definition}</div>
                        <div class="concept-importance">重要性：${concept.importance}</div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }

        // 添加相关公式
        if (example.relatedFormulas && example.relatedFormulas.length > 0) {
            html += `
                <div class="example-formulas">
                    <h4>📐 相关公式</h4>
                    <div class="formulas-list">
            `;
            
            example.relatedFormulas.forEach(formula => {
                html += `
                    <div class="formula-item">
                        <div class="formula-name">${formula.name}</div>
                        <div class="formula-expression">${formula.formula}</div>
                        <div class="formula-description">${formula.description}</div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }

        // 添加学习提示
        if (example.tips && example.tips.length > 0) {
            html += `
                <div class="example-tips">
                    <h4>💡 学习提示</h4>
                    <ul class="tips-list">
            `;
            
            example.tips.forEach(tip => {
                html += `<li>${tip}</li>`;
            });
            
            html += `
                    </ul>
                </div>
            `;
        }

        return html;
    }
}

// 导出类（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExamplesManager;
}