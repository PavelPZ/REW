using System;
using System.Linq;
using System.Linq.Expressions;
using System.Collections.Generic;

namespace LinqKit {
  /// <summary>
  /// See http://www.albahari.com/expressions for information and examples.
  /// </summary>
  /* 
  Pokusy
    static void Main(string[] args) {
      var data = new int[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 };

      Expression<Func<int, bool>> exprTree1 = num => num > 5;
      Expression<Func<int, bool>> exprTree2 = num => num < 10;
      Expression<Func<int, bool>> exprTree3 = num => num != 7;
      Expression<Func<int, int>> exprTree4 = num => num * 2;
      Func<int, bool> expr1 = exprTree1.Compile();
      Func<int, bool> expr2 = exprTree2.Compile();

      var andExpr = Ands(exprTree1, exprTree2, exprTree3);
      string str = andExpr.ToString(); //num => ((num > 5) And (Invoke(num => (num < 10), num) And Invoke(num => (num != 7), num)))
                                       
      Action<int> act = num => { num = 5; };
      Action<int> act2 = delegate(int num) { num = 5; };

      IQueryable<int> q = data.AsQueryable().Where(andExpr).Select(exprTree4); //vysledek je tree
      str = q.ToString(); //System.Int32[].Where(num => (((num > 5) And Invoke(num => (num < 10), num)) And Invoke(num => (num != 7), num))).Select(num => (num * 2))
      int[] qr = q.ToArray();

      IEnumerable<int> q2 = data.Where(andExpr.Compile()).Select(exprTree4.Compile()); //vysledek je iterator
      str = q2.ToString(); //System.Linq.Enumerable+WhereSelectArrayIterator`2[System.Int32,System.Int32]
      int[] qr2 = q2.ToArray();
    }

    static Expression<Func<T, bool>> Ands<T>(Expression<Func<T, bool>> firstExpr, params Expression<Func<T, bool>>[] otherExprs) {
      if (otherExprs == null) return firstExpr;
      var exprs = otherExprs.Where(e => e != null); if (exprs.Count() == 0) return firstExpr;
      var pars = firstExpr.Parameters; Expression res = firstExpr.Body;
      foreach (Expression item in exprs) res = Expression.And(res, Expression.Invoke(item, pars));
      return Expression.Lambda<Func<T, bool>>(res, pars);
    }
  */
  public static class PredicateBuilder {

    public static Expression<Func<T, bool>> True<T>() { return f => true; }

    public static Expression<Func<T, bool>> False<T>() { return f => false; }

    public static Expression<Func<T, bool>> Or<T>(this Expression<Func<T, bool>> expr1, Expression<Func<T, bool>> expr2) {
      var pars = expr1.Parameters;
      return Expression.Lambda<Func<T, bool>>(Expression.Or(expr1.Body, Expression.Invoke(expr2, pars)), pars);
    }

    public static Expression<Func<T, bool>> And<T>(this Expression<Func<T, bool>> expr1, Expression<Func<T, bool>> expr2) {
      var pars = expr1.Parameters;
      bool eq = expr1.Parameters == expr2.Parameters;
      return Expression.Lambda<Func<T, bool>>(Expression.And(expr1.Body, Expression.Invoke(expr2, pars)), pars);
    }

    public static Expression<Func<T, bool>> Not<T>(this Expression<Func<T, bool>> expr1) {
      var pars = expr1.Parameters;
      return Expression.Lambda<Func<T, bool>>(Expression.Not(expr1.Body), pars);
    }

  }

}
