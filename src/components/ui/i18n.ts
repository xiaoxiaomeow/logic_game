import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		debug: true,
		fallbackLng: 'en',
		resources: {
			en: {
				translation: {
					"Character.Star.Name": "Star",
					"Character.Sapphire.Name": "Sapphire",

					"LevelSelector.ChapterName": "Mathematical Logic Game",
					"LevelSelector.LevelName": "Level Selection",
					"LevelSelector.Chapter": "Chapter: ",
					"LevelSelector.Level": "Level: ",

					"Inventory.Title": "Inventory",
					"Inventory.Axioms": "Axioms",

					"ProofBoard.Statement": "Statement",
					"ProofBoard.Language": "Language",
					"ProofBoard.Axioms": "Axioms",
					"ProofBoard.Target": "Target",
					"ProofBoard.LevelFinished": "Level finished!",
					"ProofBoard.NextLevel": "Next level",
					"ProofBoard.LevelSelector": "Back to level selection",
					"ProofBoard.Excecute": "Excecute",

					"FormulaInspector.Title": "Formula Inspector",
					"FormulaInspector.PickFormula": "Click on some formula to inspect it.",
					"FormulaInspector.Formula": "Formula",
					"FormulaInspector.Description": "Description",
					"FormulaInspector.Code": "Code",

					"ProofLine.FormulaLine.Description": "This formula is not proved yet. It just serves as a hint for what you need to prove on (or before) this line.",

					"Formula.Implies.FormulaDescription": "This formula is constructed by connecting the following formulas using $\\to$.",
					"Formula.Implies.Description": "if {{phi}} then {{psi}}",
					"Formula.Not.FormulaDescription": "This formula is constructed by connecting the following formulas using $\\lnot$.",
					"Formula.Not.Description": "not {{phi}}",
					"Formula.Atomic.FormulaDescription": "This is an atomic formula.",

					"DeductionMethod.ByAxiom.ShortDescription": "by axiom",
					"DeductionMethod.ByAxiom.LongDescription": "The formula on this line is an axiom.",

					"LineInspector.Title": "Line Inspector",
					"LineInspector.LineNumber": "Line Number",
					"LineInspector.Formula": "Formula",
					"LineInspector.PendingFormula": "Formula pending proof",

					"ProofEditor.NeedLeft": "( Need ",
					"ProofEditor.NeedRight": " )",

					"ConversationProgresser.ClickToContinue": "Click to continue ...",
					"ConversationProgresser.CompleteLevelToContinue": "Complete the level to continue ...",

					"Language.PropositionalLogic.Name": "Propositional Logic",

					"Chapter.PropositionalLogic.Name": "Propositional Logic",
					"Level.PropositionalLogic.Axiom.Name": "Axiom",
					"Level.PropositionalLogic.Deduction.Name": "Deduction"
				}
			},
			zh: {
				translation: {
					"Character.Star.Name": "星",
					"Character.Sapphire.Name": "蓝宝石",

					"LevelSelector.ChapterName": "数理逻辑游戏",
					"LevelSelector.LevelName": "关卡选择",
					"LevelSelector.Chapter": "章节：",
					"LevelSelector.Level": "关卡：",

					"Inventory.Title": "物品栏",
					"Inventory.Axioms": "公理",

					"ProofBoard.Statement": "陈述",
					"ProofBoard.Language": "语言",
					"ProofBoard.Axioms": "公理",
					"ProofBoard.Target": "目标",
					"ProofBoard.LevelFinished": "关卡完成！",
					"ProofBoard.NextLevel": "下一关",
					"ProofBoard.LevelSelector": "返回关卡选择",
					"ProofBoard.Excecute": "执行",

					"FormulaInspector.Title": "公式信息",
					"FormulaInspector.PickFormula": "点击一个公式来查看它。",
					"FormulaInspector.Formula": "公式",
					"FormulaInspector.Description": "描述",
					"FormulaInspector.Code": "代码",

					"ProofLine.FormulaLine.Description": "这个公式还没有被证明。它只是提示你在这一行及之前需要证明什么。",

					"Formula.Implies.FormulaDescription": "这个公式是由以下子公式和 $\\to$ 构成的。",
					"Formula.Implies.Description": "如果 {{phi}} 则 {{psi}}",
					"Formula.Not.FormulaDescription": "这个公式是由以下子公式和 $\\lnot$ 构成的。",
					"Formula.Not.Description": "并非 {{phi}}",
					"Formula.Atomic.FormulaDescription": "这是一个原子公式。",

					"DeductionMethod.ByAxiom.ShortDescription": "由公理",
					"DeductionMethod.ByAxiom.LongDescription": "这一行上的公式是公理。",

					"LineInspector.Title": "行信息",
					"LineInspector.LineNumber": "行标",
					"LineInspector.Formula": "公式",
					"LineInspector.PendingFormula": "待证明公式",

					"ProofEditor.NeedLeft": "（需要 ",
					"ProofEditor.NeedRight": "）",

					"ConversationProgresser.ClickToContinue": "点击以继续……",
					"ConversationProgresser.CompleteLevelToContinue": "完成关卡以继续……",

					"Language.PropositionalLogic.Name": "命题逻辑",

					"Chapter.PropositionalLogic.Name": "命题逻辑",
					"Level.PropositionalLogic.Axiom.Name": "公理",
					"Level.PropositionalLogic.Deduction.Name": "推理"
				}
			}
		}
	});

export default i18n;