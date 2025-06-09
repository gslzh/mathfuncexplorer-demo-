// 函数绘图器主类
class FunctionPlotter {
    constructor() {
        this.chart = null;
        this.currentFunction = 'sin';
        this.parameters = {};
        this.xMin = -10;
        this.xMax = 10;
        this.yMin = -5;
        this.yMax = 5;
        
        // 例题库相关
        this.currentExampleIndex = 0;
        this.examplesVisible = false;
        
        // 预定义函数配置
        this.functionConfigs = {
            sin: {
                name: '正弦函数',
                expression: 'y = a·sin(b·x + c) + d',
                params: {
                    a: { label: '振幅 (a)', min: -5, max: 5, default: 1, step: 0.1 },
                    b: { label: '频率 (b)', min: -5, max: 5, default: 1, step: 0.1 },
                    c: { label: '相位 (c)', min: -10, max: 10, default: 0, step: 0.1 },
                    d: { label: '垂直位移 (d)', min: -5, max: 5, default: 0, step: 0.1 }
                },
                calculate: (x, params) => params.a * Math.sin(params.b * x + params.c) + params.d,
                getProperties: (params) => {
                    const amplitude = Math.abs(params.a);
                    const period = params.b !== 0 ? Math.abs(2 * Math.PI / params.b) : '∞';
                    const parity = params.c === 0 && params.d === 0 ? (params.a > 0 ? '奇函数' : '奇函数') : '非奇非偶';
                    return {
                        domain: 'R (实数集)',
                        range: `[${params.d - amplitude}, ${params.d + amplitude}]`,
                        parity: parity,
                        periodicity: period !== '∞' ? `周期函数，T = ${period.toFixed(2)}` : '非周期函数',
                        monotonicity: `在每个周期内先增后减`,
                        zeros: params.d === 0 ? '存在无穷多个零点' : '可能存在零点',
                        extrema: `最大值${params.d + amplitude}，最小值${params.d - amplitude}`
                    };
                }
            },
            cos: {
                name: '余弦函数',
                expression: 'y = a·cos(b·x + c) + d',
                params: {
                    a: { label: '振幅 (a)', min: -5, max: 5, default: 1, step: 0.1 },
                    b: { label: '频率 (b)', min: -5, max: 5, default: 1, step: 0.1 },
                    c: { label: '相位 (c)', min: -10, max: 10, default: 0, step: 0.1 },
                    d: { label: '垂直位移 (d)', min: -5, max: 5, default: 0, step: 0.1 }
                },
                calculate: (x, params) => params.a * Math.cos(params.b * x + params.c) + params.d,
                getProperties: (params) => {
                    const amplitude = Math.abs(params.a);
                    const period = params.b !== 0 ? Math.abs(2 * Math.PI / params.b) : '∞';
                    const parity = params.c === 0 && params.d === 0 ? '偶函数' : '非奇非偶';
                    return {
                        domain: 'R (实数集)',
                        range: `[${params.d - amplitude}, ${params.d + amplitude}]`,
                        parity: parity,
                        periodicity: period !== '∞' ? `周期函数，T = ${period.toFixed(2)}` : '非周期函数',
                        monotonicity: `在每个周期内先减后增`,
                        zeros: params.d === 0 ? '存在无穷多个零点' : '可能存在零点',
                        extrema: `最大值${params.d + amplitude}，最小值${params.d - amplitude}`
                    };
                }
            },
            tan: {
                name: '正切函数',
                expression: 'y = a·tan(b·x + c) + d',
                params: {
                    a: { label: '振幅 (a)', min: -5, max: 5, default: 1, step: 0.1 },
                    b: { label: '频率 (b)', min: -5, max: 5, default: 1, step: 0.1 },
                    c: { label: '相位 (c)', min: -10, max: 10, default: 0, step: 0.1 },
                    d: { label: '垂直位移 (d)', min: -5, max: 5, default: 0, step: 0.1 }
                },
                calculate: (x, params) => {
                    const arg = params.b * x + params.c;
                    // 检查是否接近渐近线
                    const asymptote = Math.PI / 2;
                    const normalizedArg = ((arg % Math.PI) + Math.PI) % Math.PI;
                    if (Math.abs(normalizedArg - asymptote) < 0.01) return NaN;
                    return params.a * Math.tan(arg) + params.d;
                },
                getProperties: (params) => {
                    const period = params.b !== 0 ? Math.abs(Math.PI / params.b) : '∞';
                    return {
                        domain: 'R \\ {x | x = π/2 + kπ, k∈Z}',
                        range: 'R (实数集)',
                        parity: params.c === 0 && params.d === 0 ? '奇函数' : '非奇非偶',
                        periodicity: period !== '∞' ? `周期函数，T = ${period.toFixed(2)}` : '非周期函数',
                        monotonicity: '在每个连续区间内单调递增',
                        zeros: params.d === 0 ? '存在无穷多个零点' : '可能存在零点',
                        extrema: '无极值（有垂直渐近线）'
                    };
                }
            },
            cot: {
                name: '余切函数',
                expression: 'y = a·cot(b·x + c) + d',
                params: {
                    a: { label: '振幅 (a)', min: -5, max: 5, default: 1, step: 0.1 },
                    b: { label: '频率 (b)', min: -5, max: 5, default: 1, step: 0.1 },
                    c: { label: '相位 (c)', min: -10, max: 10, default: 0, step: 0.1 },
                    d: { label: '垂直位移 (d)', min: -5, max: 5, default: 0, step: 0.1 }
                },
                calculate: (x, params) => {
                    const arg = params.b * x + params.c;
                    // 检查是否接近渐近线（sin = 0的点）
                    const normalizedArg = ((arg % Math.PI) + Math.PI) % Math.PI;
                    if (Math.abs(normalizedArg) < 0.01 || Math.abs(normalizedArg - Math.PI) < 0.01) return NaN;
                    return params.a * (1 / Math.tan(arg)) + params.d;
                },
                getProperties: (params) => {
                    const period = params.b !== 0 ? Math.abs(Math.PI / params.b) : '∞';
                    return {
                        domain: 'R \\ {x | x = kπ, k∈Z}',
                        range: 'R (实数集)',
                        parity: params.c === 0 && params.d === 0 ? '奇函数' : '非奇非偶',
                        periodicity: period !== '∞' ? `周期函数，T = ${period.toFixed(2)}` : '非周期函数',
                        monotonicity: '在每个连续区间内单调递减',
                        zeros: params.d === 0 ? '存在无穷多个零点' : '可能存在零点',
                        extrema: '无极值（有垂直渐近线）'
                    };
                }
            },
            quadratic: {
                name: '二次函数',
                expression: 'y = a·x² + b·x + c',
                params: {
                    a: { label: '二次项系数 (a)', min: -3, max: 3, default: 1, step: 0.1 },
                    b: { label: '一次项系数 (b)', min: -10, max: 10, default: 0, step: 0.1 },
                    c: { label: '常数项 (c)', min: -10, max: 10, default: 0, step: 0.1 }
                },
                calculate: (x, params) => params.a * x * x + params.b * x + params.c,
                getProperties: (params) => {
                    if (params.a === 0) {
                        return {
                            domain: 'R (实数集)',
                            range: 'R (实数集)',
                            parity: params.c === 0 ? '奇函数' : '非奇非偶',
                            periodicity: '非周期函数',
                            monotonicity: params.b > 0 ? '单调递增' : params.b < 0 ? '单调递减' : '常函数',
                            zeros: params.b !== 0 ? `x = ${(-params.c / params.b).toFixed(2)}` : (params.c === 0 ? 'R (实数集)' : '无零点'),
                            extrema: '无极值'
                        };
                    }
                    const vertex_x = -params.b / (2 * params.a);
                    const vertex_y = params.a * vertex_x * vertex_x + params.b * vertex_x + params.c;
                    const discriminant = params.b * params.b - 4 * params.a * params.c;
                    const parity = params.b === 0 ? '偶函数' : '非奇非偶';
                    
                    return {
                        domain: 'R (实数集)',
                        range: params.a > 0 ? `[${vertex_y.toFixed(2)}, +∞)` : `(-∞, ${vertex_y.toFixed(2)}]`,
                        parity: parity,
                        periodicity: '非周期函数',
                        monotonicity: params.a > 0 ? 
                            `在(-∞, ${vertex_x.toFixed(2)})上递减，在(${vertex_x.toFixed(2)}, +∞)上递增` :
                            `在(-∞, ${vertex_x.toFixed(2)})上递增，在(${vertex_x.toFixed(2)}, +∞)上递减`,
                        zeros: discriminant > 0 ? 
                            `x = ${((- params.b + Math.sqrt(discriminant)) / (2 * params.a)).toFixed(2)}, x = ${((- params.b - Math.sqrt(discriminant)) / (2 * params.a)).toFixed(2)}` :
                            discriminant === 0 ? `x = ${vertex_x.toFixed(2)}` : '无实数零点',
                        extrema: params.a > 0 ? `最小值${vertex_y.toFixed(2)}` : `最大值${vertex_y.toFixed(2)}`
                    };
                }
            },
            linear: {
                name: '一次函数',
                expression: 'y = a·x + b',
                params: {
                    a: { label: '斜率 (a)', min: -5, max: 5, default: 1, step: 0.1 },
                    b: { label: '截距 (b)', min: -10, max: 10, default: 0, step: 0.1 }
                },
                calculate: (x, params) => params.a * x + params.b,
                getProperties: (params) => {
                    const parity = params.b === 0 ? '奇函数' : '非奇非偶';
                    return {
                        domain: 'R (实数集)',
                        range: 'R (实数集)',
                        parity: parity,
                        periodicity: '非周期函数',
                        monotonicity: params.a > 0 ? '单调递增' : params.a < 0 ? '单调递减' : '常函数',
                        zeros: params.a !== 0 ? `x = ${(-params.b / params.a).toFixed(2)}` : (params.b === 0 ? 'R (实数集)' : '无零点'),
                        extrema: '无极值'
                    };
                }
            },
            exponential: {
                name: '指数函数',
                expression: 'y = a·e^(b·x) + c',
                params: {
                    a: { label: '系数 (a)', min: -3, max: 3, default: 1, step: 0.1 },
                    b: { label: '指数系数 (b)', min: -2, max: 2, default: 1, step: 0.1 },
                    c: { label: '垂直位移 (c)', min: -5, max: 5, default: 0, step: 0.1 }
                },
                calculate: (x, params) => params.a * Math.exp(params.b * x) + params.c,
                getProperties: (params) => {
                    const asymptote = params.c;
                    const range = params.a > 0 && params.b > 0 ? `(${asymptote}, +∞)` :
                                 params.a > 0 && params.b < 0 ? `(${asymptote}, +∞)` :
                                 params.a < 0 && params.b > 0 ? `(-∞, ${asymptote})` :
                                 `(-∞, ${asymptote})`;
                    return {
                        domain: 'R (实数集)',
                        range: range,
                        parity: '非奇非偶',
                        periodicity: '非周期函数',
                        monotonicity: (params.a > 0 && params.b > 0) || (params.a < 0 && params.b < 0) ? '单调递增' : '单调递减',
                        zeros: params.a !== 0 ? (params.c / params.a < 0 ? `x = ${(Math.log(-params.c / params.a) / params.b).toFixed(2)}` : '无零点') : '无零点',
                        extrema: '无极值'
                    };
                }
            },
            logarithmic: {
                name: '对数函数',
                expression: 'y = a·ln(b·x + c) + d',
                params: {
                    a: { label: '系数 (a)', min: -3, max: 3, default: 1, step: 0.1 },
                    b: { label: '内部系数 (b)', min: 0.1, max: 3, default: 1, step: 0.1 },
                    c: { label: '水平位移 (c)', min: -5, max: 5, default: 0, step: 0.1 },
                    d: { label: '垂直位移 (d)', min: -5, max: 5, default: 0, step: 0.1 }
                },
                calculate: (x, params) => {
                    const arg = params.b * x + params.c;
                    return arg > 0 ? params.a * Math.log(arg) + params.d : NaN;
                },
                getProperties: (params) => {
                    const verticalAsymptote = -params.c / params.b;
                    const domain = params.b > 0 ? `(${verticalAsymptote.toFixed(2)}, +∞)` : `(-∞, ${verticalAsymptote.toFixed(2)})`;
                    return {
                        domain: domain,
                        range: 'R (实数集)',
                        parity: '非奇非偶',
                        periodicity: '非周期函数',
                        monotonicity: (params.a > 0 && params.b > 0) || (params.a < 0 && params.b < 0) ? '单调递增' : '单调递减',
                        zeros: `x = ${((Math.exp(-params.d / params.a) - params.c) / params.b).toFixed(2)}`,
                        extrema: '无极值'
                    };
                }
            },
            power: {
                name: '幂函数',
                expression: 'y = a·x^b + c',
                params: {
                    a: { label: '系数 (a)', min: -3, max: 3, default: 1, step: 0.1 },
                    b: { label: '指数 (b)', min: -3, max: 3, default: 2, step: 0.1 },
                    c: { label: '垂直位移 (c)', min: -5, max: 5, default: 0, step: 0.1 }
                },
                calculate: (x, params) => {
                    if (x === 0 && params.b < 0) return NaN;
                    if (x < 0 && params.b % 1 !== 0) return NaN;
                    return params.a * Math.pow(x, params.b) + params.c;
                },
                getProperties: (params) => {
                    const isEven = Math.abs(params.b % 2) < 0.001;
                    const isOdd = Math.abs((params.b - 1) % 2) < 0.001;
                    const domain = params.b < 0 ? 'R \\ {0}' : (params.b % 1 === 0 || params.b > 0) ? 'R (实数集)' : '[0, +∞)';
                    const parity = isEven && params.c === 0 ? '偶函数' : isOdd && params.c === 0 ? '奇函数' : '非奇非偶';
                    
                    return {
                        domain: domain,
                        range: params.b > 0 ? (params.a > 0 ? `[${params.c}, +∞)` : `(-∞, ${params.c}]`) : 'R \\ {' + params.c + '}',
                        parity: parity,
                        periodicity: '非周期函数',
                        monotonicity: params.b > 0 ? (params.a > 0 ? '单调递增' : '单调递减') : (params.a > 0 ? '单调递减' : '单调递增'),
                        zeros: params.c === 0 ? 'x = 0' : (params.a !== 0 ? `x = ${Math.pow(-params.c / params.a, 1 / params.b).toFixed(2)}` : '无零点'),
                        extrema: params.b > 0 && params.b % 2 === 0 ? (params.a > 0 ? `最小值${params.c}` : `最大值${params.c}`) : '无极值'
                    };
                }
            },
            absolute: {
                name: '绝对值函数',
                expression: 'y = a·|b·x + c| + d',
                params: {
                    a: { label: '系数 (a)', min: -3, max: 3, default: 1, step: 0.1 },
                    b: { label: '内部系数 (b)', min: -3, max: 3, default: 1, step: 0.1 },
                    c: { label: '水平位移 (c)', min: -5, max: 5, default: 0, step: 0.1 },
                    d: { label: '垂直位移 (d)', min: -5, max: 5, default: 0, step: 0.1 }
                },
                calculate: (x, params) => params.a * Math.abs(params.b * x + params.c) + params.d,
                getProperties: (params) => {
                    const vertex_x = -params.c / params.b;
                    const vertex_y = params.d;
                    const parity = params.c === 0 && params.d === 0 ? '偶函数' : '非奇非偶';
                    
                    return {
                        domain: 'R (实数集)',
                        range: params.a > 0 ? `[${vertex_y}, +∞)` : `(-∞, ${vertex_y}]`,
                        parity: parity,
                        periodicity: '非周期函数',
                        monotonicity: params.a > 0 ? 
                            `在(-∞, ${vertex_x.toFixed(2)})上递减，在(${vertex_x.toFixed(2)}, +∞)上递增` :
                            `在(-∞, ${vertex_x.toFixed(2)})上递增，在(${vertex_x.toFixed(2)}, +∞)上递减`,
                        zeros: params.d === 0 ? `x = ${vertex_x.toFixed(2)}` : (Math.abs(params.d / params.a) <= Math.abs(params.c / params.b) ? '存在零点' : '无零点'),
                        extrema: params.a > 0 ? `最小值${vertex_y}` : `最大值${vertex_y}`
                    };
                }
            },
            reciprocal: {
                name: '反比例函数',
                expression: 'y = a/(b·x + c) + d',
                params: {
                    a: { label: '分子系数 (a)', min: -5, max: 5, default: 1, step: 0.1 },
                    b: { label: '分母系数 (b)', min: -3, max: 3, default: 1, step: 0.1 },
                    c: { label: '水平位移 (c)', min: -5, max: 5, default: 0, step: 0.1 },
                    d: { label: '垂直位移 (d)', min: -5, max: 5, default: 0, step: 0.1 }
                },
                calculate: (x, params) => {
                    const denominator = params.b * x + params.c;
                    return denominator !== 0 ? params.a / denominator + params.d : NaN;
                },
                getProperties: (params) => {
                    const verticalAsymptote = -params.c / params.b;
                    const horizontalAsymptote = params.d;
                    const domain = `R \\ {${verticalAsymptote.toFixed(2)}}`;
                    const range = `R \\ {${horizontalAsymptote}}`;
                    
                    return {
                        domain: domain,
                        range: range,
                        parity: params.c === 0 && params.d === 0 ? '奇函数' : '非奇非偶',
                        periodicity: '非周期函数',
                        monotonicity: (params.a > 0 && params.b > 0) || (params.a < 0 && params.b < 0) ? '分段递减' : '分段递增',
                        zeros: params.d === 0 ? '无零点' : `x = ${((-params.c * params.d - params.a) / (params.b * params.d)).toFixed(2)}`,
                        extrema: '无极值'
                    };
                }
            },
            sqrt: {
                name: '平方根函数',
                expression: 'y = a·√(b·x + c) + d',
                params: {
                    a: { label: '系数 (a)', min: -3, max: 3, default: 1, step: 0.1 },
                    b: { label: '内部系数 (b)', min: -3, max: 3, default: 1, step: 0.1 },
                    c: { label: '水平位移 (c)', min: -5, max: 5, default: 0, step: 0.1 },
                    d: { label: '垂直位移 (d)', min: -5, max: 5, default: 0, step: 0.1 }
                },
                calculate: (x, params) => {
                    const arg = params.b * x + params.c;
                    return arg >= 0 ? params.a * Math.sqrt(arg) + params.d : NaN;
                },
                getProperties: (params) => {
                    const startPoint = -params.c / params.b;
                    const domain = params.b > 0 ? `[${startPoint.toFixed(2)}, +∞)` : `(-∞, ${startPoint.toFixed(2)}]`;
                    const range = params.a > 0 ? `[${params.d}, +∞)` : `(-∞, ${params.d}]`;
                    
                    return {
                        domain: domain,
                        range: range,
                        parity: '非奇非偶',
                        periodicity: '非周期函数',
                        monotonicity: (params.a > 0 && params.b > 0) || (params.a < 0 && params.b < 0) ? '单调递增' : '单调递减',
                        zeros: params.d === 0 ? `x = ${startPoint.toFixed(2)}` : '可能存在零点',
                        extrema: `在x = ${startPoint.toFixed(2)}处取得${params.a > 0 ? '最小值' : '最大值'}${params.d}`
                    };
                }
            },
            piecewise: {
                name: '分段函数',
                expression: 'y = { a·x + b (x < c), d·x + e (x ≥ c) }',
                params: {
                    a: { label: '左段斜率 (a)', min: -5, max: 5, default: 1, step: 0.1 },
                    b: { label: '左段截距 (b)', min: -10, max: 10, default: 0, step: 0.1 },
                    c: { label: '分界点 (c)', min: -5, max: 5, default: 0, step: 0.1 },
                    d: { label: '右段斜率 (d)', min: -5, max: 5, default: -1, step: 0.1 },
                    e: { label: '右段截距 (e)', min: -10, max: 10, default: 0, step: 0.1 }
                },
                calculate: (x, params) => {
                    if (x < params.c) {
                        return params.a * x + params.b;
                    } else {
                        return params.d * x + params.e;
                    }
                },
                getProperties: (params) => {
                    const leftValue = params.a * params.c + params.b;
                    const rightValue = params.d * params.c + params.e;
                    const continuous = Math.abs(leftValue - rightValue) < 0.001;
                    
                    return {
                        domain: 'R (实数集)',
                        range: '根据参数确定',
                        parity: '一般为非奇非偶',
                        periodicity: '非周期函数',
                        monotonicity: `左段${params.a > 0 ? '递增' : params.a < 0 ? '递减' : '常数'}，右段${params.d > 0 ? '递增' : params.d < 0 ? '递减' : '常数'}`,
                        zeros: '可能存在零点',
                        extrema: continuous ? '可能在分界点处有极值' : `在x=${params.c}处不连续`,
                        special: `分界点: x = ${params.c}, ${continuous ? '连续' : '不连续'}`
                    };
                }
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeChart();
        this.setFunction('sin');
    }
    
    setupEventListeners() {
        // 函数类型选择
        document.getElementById('functionType').addEventListener('change', (e) => {
            this.setFunction(e.target.value);
        });
        
        // 自定义函数应用
        document.getElementById('applyCustom').addEventListener('click', () => {
            this.applyCustomFunction();
        });
        
        // 自定义函数输入框回车
        document.getElementById('customFunction').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyCustomFunction();
            }
        });
        
        // 坐标轴范围控制
        ['xMin', 'xMax', 'yMin', 'yMax'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                this[id] = parseFloat(e.target.value);
                this.updateChart();
            });
        });
        
        // 参数复位按钮
        document.getElementById('resetParameters').addEventListener('click', () => {
            this.resetParameters();
        });
        
        // 头部按钮功能
        document.getElementById('downloadImage').addEventListener('click', () => {
            this.downloadImage();
        });
        
        document.getElementById('printPage').addEventListener('click', () => {
            this.printPage();
        });
        
        document.getElementById('aboutBtn').addEventListener('click', () => {
            this.showAboutModal();
        });
        
        // 关于对话框关闭功能
        const modal = document.getElementById('aboutModal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            this.hideAboutModal();
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAboutModal();
            }
        });
        
        // 计算器功能
        document.getElementById('calculateY').addEventListener('click', () => {
            this.calculateYValue();
        });
        
        document.getElementById('clearPoint').addEventListener('click', () => {
            this.clearCalculationInput();
        });
        
        document.getElementById('xInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.calculateYValue();
            }
        });
        
        // 例题库功能
        document.getElementById('showExamples').addEventListener('click', () => {
            this.showExamples();
        });
        
        document.getElementById('hideExamples').addEventListener('click', () => {
            this.hideExamples();
        });
        
        document.getElementById('prevExample').addEventListener('click', () => {
            this.showPreviousExample();
        });
        
        document.getElementById('nextExample').addEventListener('click', () => {
            this.showNextExample();
        });
    }
    
    setFunction(functionType) {
        this.currentFunction = functionType;
        const config = this.functionConfigs[functionType];
        
        if (!config) return;
        
        // 初始化参数
        this.parameters = {};
        Object.keys(config.params).forEach(param => {
            this.parameters[param] = config.params[param].default;
        });
        
        this.generateParameterControls();
        this.updateExpression();
        this.updateFunctionProperties();
        this.removeCalculationPoint(); // 清除之前的计算点
        this.updateChart();
        
        // 如果例题库是显示状态，更新例题内容
        if (this.examplesVisible) {
            this.currentExampleIndex = 0;
            this.updateCurrentExample();
        }
    }
    
    generateParameterControls() {
        const container = document.getElementById('parameters');
        container.innerHTML = '';
        
        const config = this.functionConfigs[this.currentFunction];
        if (!config) return;
        
        Object.keys(config.params).forEach(paramName => {
            const param = config.params[paramName];
            
            const paramGroup = document.createElement('div');
            paramGroup.className = 'parameter-group';
            
            paramGroup.innerHTML = `
                <div class="parameter-label">
                    <span>${param.label}</span>
                    <span class="parameter-value" id="value-${paramName}">${this.parameters[paramName]}</span>
                </div>
                <input type="range" 
                       class="parameter-slider" 
                       id="slider-${paramName}"
                       min="${param.min}" 
                       max="${param.max}" 
                       step="${param.step}" 
                       value="${this.parameters[paramName]}">
            `;
            
            container.appendChild(paramGroup);
            
            // 添加滑块事件监听
            const slider = document.getElementById(`slider-${paramName}`);
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.parameters[paramName] = value;
                document.getElementById(`value-${paramName}`).textContent = value;
                this.updateExpression();
                this.updateFunctionProperties();
                this.updateChart();
                
                // 如果有输入的X值，重新计算Y值和更新计算点
                const xInput = document.getElementById('xInput');
                if (xInput.value && !isNaN(parseFloat(xInput.value))) {
                    this.calculateYValue();
                }
            });
        });
    }
    
    updateExpression() {
        const config = this.functionConfigs[this.currentFunction];
        if (!config) return;
        
        let expression = config.expression;
        
        // 替换参数值
        Object.keys(this.parameters).forEach(param => {
            const value = this.parameters[param];
            const formattedValue = Math.abs(value) === 1 && param !== 'c' && param !== 'd' ? 
                (value === 1 ? '' : '-') : 
                value.toString();
            expression = expression.replace(new RegExp(param, 'g'), formattedValue);
        });
        
        // 清理表达式
        expression = expression
            .replace(/·1\*/g, '·')
            .replace(/\*1\*/g, '*')
            .replace(/\+ -/g, '- ')
            .replace(/\+ 0/g, '')
            .replace(/- 0/g, '')
            .replace(/\*1(?![0-9])/g, '')
            .replace(/1\*/g, '')
            .replace(/\·/g, '');
        
        document.getElementById('expressionDisplay').textContent = expression;
    }
    
    updateFunctionProperties() {
        const config = this.functionConfigs[this.currentFunction];
        if (!config || !config.getProperties) {
            // 对于自定义函数，显示默认信息
            document.getElementById('domain').textContent = '请分析';
            document.getElementById('range').textContent = '请分析';
            document.getElementById('parity').textContent = '请分析';
            document.getElementById('periodicity').textContent = '请分析';
            document.getElementById('monotonicity').textContent = '请分析';
            document.getElementById('zeros').textContent = '请分析';
            document.getElementById('extrema').textContent = '请分析';
            return;
        }
        
        try {
            const properties = config.getProperties(this.parameters);
            
            document.getElementById('domain').textContent = properties.domain;
            document.getElementById('range').textContent = properties.range;
            document.getElementById('parity').textContent = properties.parity;
            document.getElementById('periodicity').textContent = properties.periodicity;
            document.getElementById('monotonicity').textContent = properties.monotonicity;
            document.getElementById('zeros').textContent = properties.zeros;
            document.getElementById('extrema').textContent = properties.extrema;
        } catch (e) {
            console.error('Error updating function properties:', e);
        }
    }
    
    initializeChart() {
        const ctx = document.getElementById('functionChart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: '函数图像',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    tension: 0.4,
                    cubicInterpolationMode: 'monotone'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        min: this.xMin,
                        max: this.xMax,
                        grid: {
                            color: '#e2e8f0',
                            lineWidth: 1
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        min: this.yMin,
                        max: this.yMax,
                        grid: {
                            color: '#e2e8f0',
                            lineWidth: 1
                        },
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                animation: {
                    duration: 300
                }
            }
        });
    }
    
    updateChart() {
        const config = this.functionConfigs[this.currentFunction];
        if (!config || !this.chart) return;
        
        const points = [];
        const step = (this.xMax - this.xMin) / 2000;
        
        for (let x = this.xMin; x <= this.xMax; x += step) {
            try {
                const y = config.calculate(x, this.parameters);
                if (!isNaN(y) && isFinite(y)) {
                    points.push({ x: x, y: y });
                }
            } catch (e) {
                // 忽略计算错误
            }
        }
        
        this.chart.data.datasets[0].data = points;
        this.chart.options.scales.x.min = this.xMin;
        this.chart.options.scales.x.max = this.xMax;
        this.chart.options.scales.y.min = this.yMin;
        this.chart.options.scales.y.max = this.yMax;
        
        // 保持计算点的显示（如果存在）
        if (this.chart.data.datasets.length >= 2 && this.chart.data.datasets[1].data.length > 0) {
            const calculationPoint = this.chart.data.datasets[1].data[0];
            // 检查计算点是否在当前视图范围内
            if (calculationPoint.x >= this.xMin && calculationPoint.x <= this.xMax &&
                calculationPoint.y >= this.yMin && calculationPoint.y <= this.yMax) {
                // 计算点在视图范围内，保持显示
            } else {
                // 计算点超出视图范围，可以选择隐藏或保持显示
                // 这里选择保持显示，让用户知道有计算点存在
            }
        }
        
        this.chart.update('none');
    }
    
    applyCustomFunction() {
        const input = document.getElementById('customFunction').value.trim();
        if (!input) return;
        
        try {
            // 简单的自定义函数解析（安全性有限，仅用于演示）
            const func = this.parseCustomFunction(input);
            
            // 创建临时函数配置
            this.functionConfigs.custom = {
                name: '自定义函数',
                expression: input,
                params: {},
                calculate: func
            };
            
            this.currentFunction = 'custom';
            this.parameters = {};
            
            document.getElementById('parameters').innerHTML = 
                '<p style="text-align: center; color: #6c757d; font-style: italic;">自定义函数无参数控制</p>';
            
            document.getElementById('expressionDisplay').textContent = input;
            this.updateChart();
            
        } catch (e) {
            alert('函数格式错误，请检查输入！\n支持的函数：sin, cos, tan, log, exp, sqrt, abs, pow\n支持的运算符：+, -, *, /, ^, ()\n变量：x');
        }
    }
    
    parseCustomFunction(expression) {
        // 替换数学函数
        let code = expression
            .replace(/\^/g, '**')
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/log/g, 'Math.log')
            .replace(/ln/g, 'Math.log')
            .replace(/exp/g, 'Math.exp')
            .replace(/sqrt/g, 'Math.sqrt')
            .replace(/abs/g, 'Math.abs')
            .replace(/pow/g, 'Math.pow')
            .replace(/pi/g, 'Math.PI')
            .replace(/e(?![a-zA-Z])/g, 'Math.E');
        
        // 创建函数
        return new Function('x', `return ${code};`);
    }
    
    calculateYValue() {
        const xInput = document.getElementById('xInput');
        const yResult = document.getElementById('yResult');
        
        const xValue = parseFloat(xInput.value);
        
        if (isNaN(xValue)) {
            yResult.textContent = '请输入有效的数值';
            yResult.style.color = '#dc3545';
            this.removeCalculationPoint();
            return;
        }
        
        try {
            let yValue;
            
            if (this.currentFunction === 'custom') {
                const func = this.parseCustomFunction(document.getElementById('customFunction').value);
                yValue = func(xValue);
            } else {
                const config = this.functionConfigs[this.currentFunction];
                yValue = config.calculate(xValue, this.parameters);
            }
            
            if (isNaN(yValue) || !isFinite(yValue)) {
                yResult.textContent = '函数在此点未定义';
                yResult.style.color = '#dc3545';
                this.removeCalculationPoint();
            } else {
                yResult.textContent = `当 x = ${xValue} 时，y = ${yValue.toFixed(4)}`;
                yResult.style.color = '#155724';
                this.addCalculationPoint(xValue, yValue);
            }
        } catch (error) {
            yResult.textContent = '计算错误，请检查函数';
            yResult.style.color = '#dc3545';
            this.removeCalculationPoint();
        }
    }
    
    addCalculationPoint(x, y) {
        if (!this.chart) return;
        
        // 确保有计算点数据集
        if (this.chart.data.datasets.length < 2) {
            this.chart.data.datasets.push({
                label: '计算点',
                data: [],
                borderColor: '#ff4757',
                backgroundColor: '#ff4757',
                borderWidth: 3,
                fill: false,
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false,
                tension: 0
            });
        }
        
        // 更新计算点数据
        this.chart.data.datasets[1].data = [{ x: x, y: y }];
        this.chart.update('none');
    }
    
    removeCalculationPoint() {
        if (!this.chart || this.chart.data.datasets.length < 2) return;
        
        // 清空计算点数据
        this.chart.data.datasets[1].data = [];
        this.chart.update('none');
    }
    
    clearCalculationInput() {
        // 清除输入框
        document.getElementById('xInput').value = '';
        
        // 重置计算结果显示
        const yResult = document.getElementById('yResult');
        yResult.textContent = '请输入X值进行计算';
        yResult.style.color = '#155724';
        
        // 清除图像上的计算点
        this.removeCalculationPoint();
    }
    
    resetView() {
        this.xMin = -10;
        this.xMax = 10;
        this.yMin = -5;
        this.yMax = 5;
        
        document.getElementById('xMin').value = this.xMin;
        document.getElementById('xMax').value = this.xMax;
        document.getElementById('yMin').value = this.yMin;
        document.getElementById('yMax').value = this.yMax;
        
        this.updateChart();
    }
    
    resetParameters() {
        // 获取当前函数的配置
        const config = this.functionConfigs[this.currentFunction];
        if (!config) return;
        
        // 重置所有参数到默认值
        Object.keys(config.params).forEach(paramName => {
            this.parameters[paramName] = config.params[paramName].default;
            
            // 更新滑块值
            const slider = document.getElementById(`slider-${paramName}`);
            if (slider) {
                slider.value = this.parameters[paramName];
            }
            
            // 更新显示的参数值
            const valueDisplay = document.getElementById(`value-${paramName}`);
            if (valueDisplay) {
                valueDisplay.textContent = this.parameters[paramName];
            }
        });
        
        // 更新函数表达式和属性
        this.updateExpression();
        this.updateFunctionProperties();
        
        // 清除计算点标记
        this.removeCalculationPoint();
        
        // 更新图表
        this.updateChart();
    }
    
    getExamplesForFunction() {
        const examples = {
            sin: [
                {
                    title: "正弦函数的基本性质",
                    question: "已知函数 f(x) = 2sin(x + π/3)，求：\n1. 函数的振幅\n2. 函数的周期\n3. 函数的初相位",
                    solution: "解：\n1. 振幅 A = 2\n2. 周期 T = 2π/1 = 2π\n3. 初相位 φ = π/3",
                    explanation: "对于正弦函数 f(x) = A·sin(ωx + φ)：\n• 振幅为 |A|，表示函数值的最大偏离\n• 周期为 T = 2π/|ω|\n• 初相位为 φ，表示函数图像的水平平移"
                },
                {
                    title: "正弦函数的图像变换",
                    question: "将函数 y = sin(x) 的图像向左平移 π/4 个单位，再向上平移 1 个单位，得到的函数解析式是什么？",
                    solution: "解：\n向左平移 π/4：y = sin(x + π/4)\n向上平移 1：y = sin(x + π/4) + 1",
                    explanation: "函数图像变换规律：\n• 水平平移：f(x±a) 表示向左(+)或向右(-)平移 a 个单位\n• 竖直平移：f(x)±b 表示向上(+)或向下(-)平移 b 个单位"
                }
            ],
            cos: [
                {
                    title: "余弦函数的对称性",
                    question: "函数 f(x) = 3cos(2x - π/6) 的对称轴方程是什么？",
                    solution: "解：\n令 2x - π/6 = kπ (k∈Z)\n解得：x = kπ/2 + π/12\n所以对称轴方程为：x = kπ/2 + π/12 (k∈Z)",
                    explanation: "余弦函数 y = A·cos(ωx + φ) 的对称轴满足：\nωx + φ = kπ (k∈Z)\n这是因为余弦函数在 x = kπ 处取得最值"
                }
            ],
            quadratic: [
                {
                    title: "二次函数的顶点坐标",
                    question: "求二次函数 f(x) = 2x² - 8x + 6 的顶点坐标和对称轴。",
                    solution: "解：\n方法一：配方法\nf(x) = 2(x² - 4x) + 6 = 2(x² - 4x + 4 - 4) + 6\n= 2(x - 2)² - 8 + 6 = 2(x - 2)² - 2\n顶点坐标：(2, -2)，对称轴：x = 2",
                    explanation: "二次函数 f(x) = ax² + bx + c 的顶点坐标为：\n(-b/2a, f(-b/2a))\n对称轴方程为：x = -b/2a"
                }
            ],
            linear: [
                {
                    title: "一次函数的应用",
                    question: "某商品的成本为每件20元，售价为每件30元。设销售x件商品的利润为y元，写出y关于x的函数关系式。",
                    solution: "解：\n每件商品的利润 = 30 - 20 = 10元\n销售x件商品的总利润：y = 10x\n所以函数关系式为：y = 10x (x≥0)",
                    explanation: "一次函数的一般形式：y = kx + b\n其中k为斜率，表示变化率；b为截距，表示初始值"
                }
            ],
            exponential: [
                {
                    title: "指数函数的性质",
                    question: "比较 2^1.5 和 2^1.7 的大小，并说明理由。",
                    solution: "解：\n因为指数函数 y = 2^x 在定义域内单调递增\n且 1.5 < 1.7\n所以 2^1.5 < 2^1.7",
                    explanation: "指数函数 y = a^x (a>1) 的性质：\n• 定义域：R，值域：(0,+∞)\n• 在R上单调递增\n• 过点(0,1)"
                }
            ]
        };
        
        return examples[this.currentFunction] || [];
    }
    
    showExamples() {
        this.examplesVisible = true;
        this.currentExampleIndex = 0;
        document.getElementById('examplesContent').style.display = 'block';
        this.updateCurrentExample();
    }
    
    hideExamples() {
        this.examplesVisible = false;
        document.getElementById('examplesContent').style.display = 'none';
    }
    
    showPreviousExample() {
        const examples = this.getExamplesForFunction();
        if (examples.length > 0) {
            this.currentExampleIndex = (this.currentExampleIndex - 1 + examples.length) % examples.length;
            this.updateCurrentExample();
        }
    }
    
    showNextExample() {
        const examples = this.getExamplesForFunction();
        if (examples.length > 0) {
            this.currentExampleIndex = (this.currentExampleIndex + 1) % examples.length;
            this.updateCurrentExample();
        }
    }
    
    updateCurrentExample() {
        const examples = this.getExamplesForFunction();
        const exampleElement = document.getElementById('currentExample');
        const prevButton = document.getElementById('prevExample');
        const nextButton = document.getElementById('nextExample');
        
        if (examples.length === 0) {
            exampleElement.innerHTML = `
                <div class="example-title">暂无例题</div>
                <div class="example-question">当前函数类型暂无例题，请选择其他函数类型查看例题。</div>
            `;
            prevButton.disabled = true;
            nextButton.disabled = true;
            return;
        }
        
        const example = examples[this.currentExampleIndex];
        exampleElement.innerHTML = `
            <div class="example-title">${example.title} (${this.currentExampleIndex + 1}/${examples.length})</div>
            <div class="example-question">
                <strong>题目：</strong><br>
                ${example.question.replace(/\n/g, '<br>')}
            </div>
            <div class="example-solution">
                <strong>解答：</strong><br>
                ${example.solution.replace(/\n/g, '<br>')}
            </div>
            <div class="example-explanation">
                <strong>知识点解析：</strong><br>
                ${example.explanation.replace(/\n/g, '<br>')}
            </div>
        `;
        
        prevButton.disabled = examples.length <= 1;
        nextButton.disabled = examples.length <= 1;
    }
    
    // 下载图像功能
    downloadImage() {
        const canvas = this.chart.canvas;
        
        // 创建高分辨率的临时canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // 设置更高的分辨率
        const scale = 2;
        tempCanvas.width = canvas.width * scale;
        tempCanvas.height = canvas.height * scale;
        
        // 设置高质量渲染
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        
        // 缩放上下文
        tempCtx.scale(scale, scale);
        
        // 绘制白色背景
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 将原canvas内容绘制到临时canvas
        tempCtx.drawImage(canvas, 0, 0);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `数学函数图像_${this.currentFunction}_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = tempCanvas.toDataURL('image/png', 1.0);
        link.click();
    }
    
    // 打印页面
    printPage() {
        try {
            // 获取图表画布
            const canvas = this.chart.canvas;
            
            // 创建高分辨率的临时canvas用于打印
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // 设置更高的分辨率
            const scale = 3;
            tempCanvas.width = canvas.width * scale;
            tempCanvas.height = canvas.height * scale;
            
            // 设置高质量渲染
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            
            // 缩放上下文
            tempCtx.scale(scale, scale);
            
            // 绘制白色背景
            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 将原canvas内容绘制到临时canvas
            tempCtx.drawImage(canvas, 0, 0);
            
            // 获取高质量图像数据
            const imageDataUrl = tempCanvas.toDataURL('image/png', 1.0);
            
            // 尝试打开新窗口，如果失败则使用当前窗口
            let printWindow;
            try {
                printWindow = window.open('', '_blank', 'width=800,height=600');
            } catch (e) {
                console.warn('无法打开新窗口，使用当前窗口打印');
            }
            
            if (!printWindow) {
                // 如果无法打开新窗口，在当前页面创建打印内容
                this.printInCurrentWindow(imageDataUrl);
                return;
            }
            
            printWindow.document.write(`
                <html>
                    <head>
                        <title>函数图像打印</title>
                        <style>
                            body {
                                margin: 0;
                                padding: 20px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                background: white;
                            }
                            .print-header {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .print-header h1 {
                                color: #2c3e50;
                                margin: 0 0 10px 0;
                                font-size: 24px;
                            }
                            .print-header p {
                                color: #7f8c8d;
                                margin: 5px 0;
                                font-size: 14px;
                            }
                            .chart-container {
                                border: 2px solid #ddd;
                                border-radius: 8px;
                                padding: 10px;
                                background: white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            }
                            .chart-image {
                                max-width: 100%;
                                height: auto;
                                display: block;
                            }
                            @media print {
                                body { 
                                    margin: 0;
                                    padding: 10px;
                                }
                                .chart-container { 
                                    border: 1px solid #000;
                                    box-shadow: none;
                                }
                                .print-header h1 {
                                    color: #000;
                                }
                                .print-header p {
                                    color: #000;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="print-header">
                            <h1>数学函数图像</h1>
                            <p>函数: ${this.functions[this.currentFunction].expression}</p>
                            <p>生成时间: ${new Date().toLocaleString()}</p>
                        </div>
                        <div class="chart-container">
                            <img src="${imageDataUrl}" class="chart-image" alt="函数图像" />
                        </div>
                    </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // 等待图像加载完成后打印
            const img = printWindow.document.querySelector('.chart-image');
            img.onload = function() {
                setTimeout(() => {
                    printWindow.print();
                    setTimeout(() => {
                        printWindow.close();
                    }, 1000);
                }, 500);
            };
            
            // 如果图像已经加载，直接打印
            if (img.complete) {
                setTimeout(() => {
                    printWindow.print();
                    setTimeout(() => {
                        printWindow.close();
                    }, 1000);
                }, 500);
            }
            
        } catch (error) {
            console.error('打印功能出错:', error);
            alert('打印功能出现错误，请稍后重试');
        }
    }
    
    // 在当前窗口打印的备用方法
    printInCurrentWindow(imageDataUrl) {
        // 保存当前页面内容
        const originalContent = document.body.innerHTML;
        
        // 创建打印内容
        const printContent = `
            <div style="text-align: center; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <h1 style="color: #2c3e50; margin-bottom: 10px;">数学函数图像</h1>
                <p style="color: #7f8c8d; margin: 5px 0;">函数: ${this.functions[this.currentFunction].expression}</p>
                <p style="color: #7f8c8d; margin: 5px 0;">生成时间: ${new Date().toLocaleString()}</p>
                <div style="margin: 20px 0; border: 2px solid #ddd; border-radius: 8px; padding: 10px; display: inline-block;">
                    <img src="${imageDataUrl}" style="max-width: 100%; height: auto;" alt="函数图像" />
                </div>
            </div>
        `;
        
        // 替换页面内容
        document.body.innerHTML = printContent;
        
        // 打印
        window.print();
        
        // 恢复原始内容
        setTimeout(() => {
            document.body.innerHTML = originalContent;
            // 重新初始化页面（因为事件监听器可能丢失）
            new FunctionPlotter();
        }, 1000);
    }
    
    // 显示关于对话框
    showAboutModal() {
        const modal = document.getElementById('aboutModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // 隐藏关于对话框
    hideAboutModal() {
        const modal = document.getElementById('aboutModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new FunctionPlotter();
});