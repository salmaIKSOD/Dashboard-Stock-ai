-- ============================================================
--  INIT.SQL — Script d'initialisation automatique
--  Exécuté UNE SEULE FOIS au premier démarrage de l'application
--  NE PAS modifier les bases SAGE ici — l'encadrant les ajoute
--  lui-même via l'interface Gestion Bases de Données
-- ============================================================

-- ── 1. Création de la base Test ──────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'Test')
BEGIN
    CREATE DATABASE Test;
END
GO

USE Test;
GO

-- ── 2. Schéma stock ──────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'stock')
BEGIN
    EXEC('CREATE SCHEMA stock');
END
GO

-- ── 3. Table registre des bases SAGE (vide par défaut) ───────
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE s.name = 'stock' AND t.name = 'SAGE_Bases'
)
BEGIN
    CREATE TABLE stock.SAGE_Bases
    (
        BaseID      INT IDENTITY(1,1) PRIMARY KEY,
        BaseName    NVARCHAR(128) NOT NULL UNIQUE,
        BaseLabel   NVARCHAR(255) NOT NULL,
        IsActive    BIT NOT NULL DEFAULT 1,
        DateAjout   DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ── 4. Table CacheFiltres ────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE s.name = 'stock' AND t.name = 'CacheFiltres'
)
BEGIN
    CREATE TABLE stock.CacheFiltres
    (
        CacheID         INT IDENTITY(1,1) PRIMARY KEY,
        BaseName        NVARCHAR(128)  NOT NULL,
        TypeFiltre      NVARCHAR(20)   NOT NULL,
        Code            NVARCHAR(255)  NOT NULL,
        Libelle         NVARCHAR(500)  NOT NULL,
        CL_No1_Parent   INT            NULL,
        FA_Code_Parent  NVARCHAR(10)   NULL,
        DateRefresh     DATETIME       NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_CacheFiltres_Lookup
        ON stock.CacheFiltres (BaseName, TypeFiltre, CL_No1_Parent, FA_Code_Parent)
        INCLUDE (Code, Libelle);
END
GO

-- ── 5. Table StockJournalierCache ────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE s.name = 'stock' AND t.name = 'StockJournalierCache'
)
BEGIN
    CREATE TABLE stock.StockJournalierCache
    (
        CacheID         INT IDENTITY(1,1) PRIMARY KEY,
        BaseName        NVARCHAR(128) NOT NULL,
        DateJour        DATE          NOT NULL,
        AR_Ref          NVARCHAR(50)  NOT NULL,
        AR_Design       NVARCHAR(255) NULL,
        FA_CodeFamille  NVARCHAR(10)  NULL,
        FA_Intitule     NVARCHAR(255) NULL,
        CL_No1          INT           NULL,
        CL_Intitule1    NVARCHAR(255) NULL,
        CL_No2          INT           NULL,
        CL_Intitule2    NVARCHAR(255) NULL,
        CL_No3          INT           NULL,
        CL_Intitule3    NVARCHAR(255) NULL,
        CL_No4          INT           NULL,
        CL_Intitule4    NVARCHAR(255) NULL,
        DE_No           INT           NOT NULL,
        DE_Intitule     NVARCHAR(255) NULL,
        TotalEntree     DECIMAL(18,4) NOT NULL DEFAULT 0,
        TotalSortie     DECIMAL(18,4) NOT NULL DEFAULT 0,
        ValeurEntree    DECIMAL(18,4) NULL,
        ValeurSortie    DECIMAL(18,4) NULL,
        StockInitial    DECIMAL(18,4) NULL,
        StockFinal      DECIMAL(18,4) NULL,
        ValeurInitiale  DECIMAL(18,4) NULL,
        ValeurFinale    DECIMAL(18,4) NULL,
        DateRefresh     DATETIME      NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_StockCache_Principal
        ON stock.StockJournalierCache
        (BaseName, DateJour, AR_Ref, DE_No)
        INCLUDE (AR_Design, FA_CodeFamille, FA_Intitule,
                 CL_No1, CL_Intitule1, CL_No2, CL_Intitule2,
                 CL_No3, CL_Intitule3, CL_No4, CL_Intitule4,
                 DE_Intitule, TotalEntree, TotalSortie,
                 ValeurEntree, ValeurSortie,
                 StockInitial, StockFinal, ValeurInitiale, ValeurFinale);

    CREATE INDEX IX_StockCache_Famille
        ON stock.StockJournalierCache (BaseName, FA_CodeFamille, DateJour);

    CREATE INDEX IX_StockCache_Cat1
        ON stock.StockJournalierCache (BaseName, CL_No1, DateJour);
END
GO

-- ── 6. Vue VW_MouvementsJournaliers (vide au départ) ─────────
CREATE OR ALTER VIEW stock.VW_MouvementsJournaliers
AS
SELECT
    CAST(NULL AS NVARCHAR(128)) AS BaseName,
    CAST(NULL AS DATE)          AS DateJour,
    CAST(NULL AS NVARCHAR(50))  AS AR_Ref,
    CAST(NULL AS NVARCHAR(255)) AS AR_Design,
    CAST(NULL AS NVARCHAR(10))  AS FA_CodeFamille,
    CAST(NULL AS NVARCHAR(255)) AS FA_Intitule,
    CAST(NULL AS INT)           AS CL_No1,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule1,
    CAST(NULL AS INT)           AS CL_No2,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule2,
    CAST(NULL AS INT)           AS CL_No3,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule3,
    CAST(NULL AS INT)           AS CL_No4,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule4,
    CAST(NULL AS INT)           AS DE_No,
    CAST(NULL AS NVARCHAR(255)) AS DE_Intitule,
    CAST(NULL AS DECIMAL(18,4)) AS TotalEntree,
    CAST(NULL AS DECIMAL(18,4)) AS TotalSortie,
    CAST(NULL AS DECIMAL(18,4)) AS ValeurEntree,
    CAST(NULL AS DECIMAL(18,4)) AS ValeurSortie,
    CAST(NULL AS DECIMAL(18,4)) AS TotalValeurMouvement
WHERE 1 = 0;
GO

-- ── 7. Vue VW_StockJoursAvecMvt (vide au départ) ─────────────
CREATE OR ALTER VIEW stock.VW_StockJoursAvecMvt
AS
SELECT
    CAST(NULL AS NVARCHAR(128)) AS BaseName,
    CAST(NULL AS DATE)          AS DateJour,
    CAST(NULL AS NVARCHAR(50))  AS AR_Ref,
    CAST(NULL AS NVARCHAR(255)) AS AR_Design,
    CAST(NULL AS NVARCHAR(10))  AS FA_CodeFamille,
    CAST(NULL AS NVARCHAR(255)) AS FA_Intitule,
    CAST(NULL AS INT)           AS CL_No1,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule1,
    CAST(NULL AS INT)           AS CL_No2,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule2,
    CAST(NULL AS INT)           AS CL_No3,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule3,
    CAST(NULL AS INT)           AS CL_No4,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule4,
    CAST(NULL AS INT)           AS DE_No,
    CAST(NULL AS NVARCHAR(255)) AS DE_Intitule,
    CAST(NULL AS DECIMAL(18,4)) AS TotalEntree,
    CAST(NULL AS DECIMAL(18,4)) AS TotalSortie,
    CAST(NULL AS DECIMAL(18,4)) AS ValeurEntree,
    CAST(NULL AS DECIMAL(18,4)) AS ValeurSortie,
    CAST(NULL AS DECIMAL(18,4)) AS StockInitial,
    CAST(NULL AS DECIMAL(18,4)) AS StockFinal,
    CAST(NULL AS DECIMAL(18,4)) AS ValeurInitiale,
    CAST(NULL AS DECIMAL(18,4)) AS ValeurFinale
WHERE 1 = 0;
GO

-- ── 8. SP_RebuildUnifiedViews ────────────────────────────────
CREATE OR ALTER PROCEDURE stock.SP_RebuildUnifiedViews
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @bases TABLE (BaseName NVARCHAR(128));
    INSERT INTO @bases SELECT BaseName FROM stock.SAGE_Bases WHERE IsActive = 1;

    DECLARE @b         NVARCHAR(128);
    DECLARE @sqlMvt    NVARCHAR(MAX);
    DECLARE @sqlStock  NVARCHAR(MAX);
    DECLARE @firstMvt  BIT = 1;
    DECLARE @firstStock BIT = 1;

    -- Si aucune base active : vues vides
    IF NOT EXISTS (SELECT 1 FROM @bases)
    BEGIN
        EXEC sp_executesql N'
        CREATE OR ALTER VIEW stock.VW_MouvementsJournaliers AS
        SELECT CAST(NULL AS NVARCHAR(128)) AS BaseName,
               CAST(NULL AS DATE)          AS DateJour,
               CAST(NULL AS NVARCHAR(50))  AS AR_Ref,
               CAST(NULL AS NVARCHAR(255)) AS AR_Design,
               CAST(NULL AS NVARCHAR(10))  AS FA_CodeFamille,
               CAST(NULL AS NVARCHAR(255)) AS FA_Intitule,
               CAST(NULL AS INT)           AS CL_No1,
               CAST(NULL AS NVARCHAR(255)) AS CL_Intitule1,
               CAST(NULL AS INT)           AS CL_No2,
               CAST(NULL AS NVARCHAR(255)) AS CL_Intitule2,
               CAST(NULL AS INT)           AS CL_No3,
               CAST(NULL AS NVARCHAR(255)) AS CL_Intitule3,
               CAST(NULL AS INT)           AS CL_No4,
               CAST(NULL AS NVARCHAR(255)) AS CL_Intitule4,
               CAST(NULL AS INT)           AS DE_No,
               CAST(NULL AS NVARCHAR(255)) AS DE_Intitule,
               CAST(NULL AS DECIMAL(18,4)) AS TotalEntree,
               CAST(NULL AS DECIMAL(18,4)) AS TotalSortie,
               CAST(NULL AS DECIMAL(18,4)) AS ValeurEntree,
               CAST(NULL AS DECIMAL(18,4)) AS ValeurSortie,
               CAST(NULL AS DECIMAL(18,4)) AS TotalValeurMouvement
        WHERE 1=0';

        EXEC sp_executesql N'
        CREATE OR ALTER VIEW stock.VW_StockJoursAvecMvt AS
        SELECT CAST(NULL AS NVARCHAR(128)) AS BaseName,
               CAST(NULL AS DATE)          AS DateJour,
               CAST(NULL AS NVARCHAR(50))  AS AR_Ref,
               CAST(NULL AS NVARCHAR(255)) AS AR_Design,
               CAST(NULL AS NVARCHAR(10))  AS FA_CodeFamille,
               CAST(NULL AS NVARCHAR(255)) AS FA_Intitule,
               CAST(NULL AS INT)           AS CL_No1,
               CAST(NULL AS NVARCHAR(255)) AS CL_Intitule1,
               CAST(NULL AS INT)           AS CL_No2,
               CAST(NULL AS NVARCHAR(255)) AS CL_Intitule2,
               CAST(NULL AS INT)           AS CL_No3,
               CAST(NULL AS NVARCHAR(255)) AS CL_Intitule3,
               CAST(NULL AS INT)           AS CL_No4,
               CAST(NULL AS NVARCHAR(255)) AS CL_Intitule4,
               CAST(NULL AS INT)           AS DE_No,
               CAST(NULL AS NVARCHAR(255)) AS DE_Intitule,
               CAST(NULL AS DECIMAL(18,4)) AS TotalEntree,
               CAST(NULL AS DECIMAL(18,4)) AS TotalSortie,
               CAST(NULL AS DECIMAL(18,4)) AS ValeurEntree,
               CAST(NULL AS DECIMAL(18,4)) AS ValeurSortie,
               CAST(NULL AS DECIMAL(18,4)) AS StockInitial,
               CAST(NULL AS DECIMAL(18,4)) AS StockFinal,
               CAST(NULL AS DECIMAL(18,4)) AS ValeurInitiale,
               CAST(NULL AS DECIMAL(18,4)) AS ValeurFinale
        WHERE 1=0';
        RETURN;
    END

    -- Rebuild VW_MouvementsJournaliers
    SET @sqlMvt = N'CREATE OR ALTER VIEW stock.VW_MouvementsJournaliers AS ';

    DECLARE cur CURSOR FOR SELECT BaseName FROM @bases;
    OPEN cur; FETCH NEXT FROM cur INTO @b;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF @firstMvt = 0 SET @sqlMvt += N' UNION ALL ';
        SET @sqlMvt += N'
        SELECT ''' + @b + N''' AS BaseName,
            CAST(dl.DO_Date AS DATE) AS DateJour,
            dl.AR_Ref, fa.AR_Design, fa.FA_CodeFamille, fam.FA_Intitule,
            fa.CL_No1, cl1.CL_Intitule AS CL_Intitule1,
            fa.CL_No2, cl2.CL_Intitule AS CL_Intitule2,
            fa.CL_No3, cl3.CL_Intitule AS CL_Intitule3,
            fa.CL_No4, cl4.CL_Intitule AS CL_Intitule4,
            dl.DE_No, dp.DE_Intitule,
            SUM(CASE WHEN dl.DL_MvtStock=1 THEN ABS(dl.DL_Qte) ELSE 0 END) AS TotalEntree,
            SUM(CASE WHEN dl.DL_MvtStock=3 THEN ABS(dl.DL_Qte) ELSE 0 END) AS TotalSortie,
            SUM(CASE WHEN dl.DL_MvtStock=1 THEN ABS(dl.DL_Qte)*dl.DL_PrixRU ELSE 0 END) AS ValeurEntree,
            SUM(CASE WHEN dl.DL_MvtStock=3 THEN ABS(dl.DL_Qte)*dl.DL_PrixRU ELSE 0 END) AS ValeurSortie,
            SUM(CASE WHEN dl.DL_MvtStock=1 THEN ABS(dl.DL_Qte)*dl.DL_PrixRU ELSE 0 END)
           -SUM(CASE WHEN dl.DL_MvtStock=3 THEN ABS(dl.DL_Qte)*dl.DL_PrixRU ELSE 0 END) AS TotalValeurMouvement
        FROM [' + @b + N'].dbo.F_DOCLIGNE dl
        INNER JOIN [' + @b + N'].dbo.F_ARTICLE fa ON fa.AR_Ref=dl.AR_Ref
        INNER JOIN [' + @b + N'].dbo.F_DEPOT dp ON dp.DE_No=dl.DE_No
        LEFT JOIN [' + @b + N'].dbo.F_FAMILLE fam ON fam.FA_CodeFamille=fa.FA_CodeFamille
        LEFT JOIN [' + @b + N'].dbo.F_CATALOGUE cl1 ON cl1.CL_No=fa.CL_No1
        LEFT JOIN [' + @b + N'].dbo.F_CATALOGUE cl2 ON cl2.CL_No=fa.CL_No2
        LEFT JOIN [' + @b + N'].dbo.F_CATALOGUE cl3 ON cl3.CL_No=fa.CL_No3
        LEFT JOIN [' + @b + N'].dbo.F_CATALOGUE cl4 ON cl4.CL_No=fa.CL_No4
        WHERE dl.DL_MvtStock IN (1,3)
        GROUP BY CAST(dl.DO_Date AS DATE), dl.AR_Ref, fa.AR_Design,
            fa.FA_CodeFamille, fam.FA_Intitule,
            fa.CL_No1, cl1.CL_Intitule, fa.CL_No2, cl2.CL_Intitule,
            fa.CL_No3, cl3.CL_Intitule, fa.CL_No4, cl4.CL_Intitule,
            dl.DE_No, dp.DE_Intitule';
        SET @firstMvt = 0;
        FETCH NEXT FROM cur INTO @b;
    END
    CLOSE cur; DEALLOCATE cur;
    EXEC sp_executesql @sqlMvt;

    -- Rebuild VW_StockJoursAvecMvt
    SET @sqlStock = N'CREATE OR ALTER VIEW stock.VW_StockJoursAvecMvt AS ';

    DECLARE cur2 CURSOR FOR SELECT BaseName FROM @bases;
    OPEN cur2; FETCH NEXT FROM cur2 INTO @b;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF @firstStock = 0 SET @sqlStock += N' UNION ALL ';
        SET @sqlStock += N'
        SELECT ''' + @b + N''' AS BaseName,
            DateJour, AR_Ref, AR_Design, FA_CodeFamille, FA_Intitule,
            CL_No1, CL_Intitule1, CL_No2, CL_Intitule2,
            CL_No3, CL_Intitule3, CL_No4, CL_Intitule4,
            DE_No, DE_Intitule,
            TotalEntree, TotalSortie, ValeurEntree, ValeurSortie,
            StockInitial, StockFinal, ValeurInitiale, ValeurFinale
        FROM [' + @b + N'].dbo.VW_StockJoursAvecMvt';
        SET @firstStock = 0;
        FETCH NEXT FROM cur2 INTO @b;
    END
    CLOSE cur2; DEALLOCATE cur2;
    EXEC sp_executesql @sqlStock;
END
GO

-- ── 9. SP_RefreshCacheFiltres ────────────────────────────────
CREATE OR ALTER PROCEDURE stock.SP_RefreshCacheFiltres
AS
BEGIN
    SET NOCOUNT ON;
    TRUNCATE TABLE stock.CacheFiltres;

    DECLARE @BaseName NVARCHAR(128);
    DECLARE @sql      NVARCHAR(MAX);

    DECLARE cur CURSOR FOR
        SELECT BaseName FROM stock.SAGE_Bases WHERE IsActive = 1;

    OPEN cur;
    FETCH NEXT FROM cur INTO @BaseName;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @sql = N'INSERT INTO Test.stock.CacheFiltres (BaseName, TypeFiltre, Code, Libelle, CL_No1_Parent, FA_Code_Parent)
        SELECT DISTINCT ''' + @BaseName + N''', ''article'', fa.AR_Ref, fa.AR_Design, fa.CL_No1, fa.FA_CodeFamille
        FROM [' + @BaseName + N'].dbo.F_DOCLIGNE dl
        INNER JOIN [' + @BaseName + N'].dbo.F_ARTICLE fa ON fa.AR_Ref = dl.AR_Ref
        WHERE dl.DL_MvtStock IN (1, 3);';
        EXEC sp_executesql @sql;

        SET @sql = N'INSERT INTO Test.stock.CacheFiltres (BaseName, TypeFiltre, Code, Libelle)
        SELECT DISTINCT ''' + @BaseName + N''', ''depot'', CAST(dp.DE_No AS NVARCHAR(255)), dp.DE_Intitule
        FROM [' + @BaseName + N'].dbo.F_DOCLIGNE dl
        INNER JOIN [' + @BaseName + N'].dbo.F_DEPOT dp ON dp.DE_No = dl.DE_No
        WHERE dl.DL_MvtStock IN (1, 3);';
        EXEC sp_executesql @sql;

        SET @sql = N'INSERT INTO Test.stock.CacheFiltres (BaseName, TypeFiltre, Code, Libelle)
        SELECT DISTINCT ''' + @BaseName + N''', ''famille'', fa.FA_CodeFamille, fam.FA_Intitule
        FROM [' + @BaseName + N'].dbo.F_DOCLIGNE dl
        INNER JOIN [' + @BaseName + N'].dbo.F_ARTICLE fa ON fa.AR_Ref = dl.AR_Ref
        INNER JOIN [' + @BaseName + N'].dbo.F_FAMILLE fam ON fam.FA_CodeFamille = fa.FA_CodeFamille
        WHERE dl.DL_MvtStock IN (1, 3) AND fa.FA_CodeFamille IS NOT NULL;';
        EXEC sp_executesql @sql;

        SET @sql = N'INSERT INTO Test.stock.CacheFiltres (BaseName, TypeFiltre, Code, Libelle)
        SELECT DISTINCT ''' + @BaseName + N''', ''cat1'', CAST(fa.CL_No1 AS NVARCHAR(255)), cl1.CL_Intitule
        FROM [' + @BaseName + N'].dbo.F_DOCLIGNE dl
        INNER JOIN [' + @BaseName + N'].dbo.F_ARTICLE fa ON fa.AR_Ref = dl.AR_Ref
        INNER JOIN [' + @BaseName + N'].dbo.F_CATALOGUE cl1 ON cl1.CL_No = fa.CL_No1
        WHERE dl.DL_MvtStock IN (1, 3) AND fa.CL_No1 IS NOT NULL;';
        EXEC sp_executesql @sql;

        SET @sql = N'INSERT INTO Test.stock.CacheFiltres (BaseName, TypeFiltre, Code, Libelle, CL_No1_Parent)
        SELECT DISTINCT ''' + @BaseName + N''', ''cat2'', CAST(fa.CL_No2 AS NVARCHAR(255)), cl2.CL_Intitule, fa.CL_No1
        FROM [' + @BaseName + N'].dbo.F_DOCLIGNE dl
        INNER JOIN [' + @BaseName + N'].dbo.F_ARTICLE fa ON fa.AR_Ref = dl.AR_Ref
        INNER JOIN [' + @BaseName + N'].dbo.F_CATALOGUE cl2 ON cl2.CL_No = fa.CL_No2
        WHERE dl.DL_MvtStock IN (1, 3) AND fa.CL_No2 IS NOT NULL;';
        EXEC sp_executesql @sql;

        SET @sql = N'INSERT INTO Test.stock.CacheFiltres (BaseName, TypeFiltre, Code, Libelle, CL_No1_Parent)
        SELECT DISTINCT ''' + @BaseName + N''', ''cat3'', CAST(fa.CL_No3 AS NVARCHAR(255)), cl3.CL_Intitule, fa.CL_No1
        FROM [' + @BaseName + N'].dbo.F_DOCLIGNE dl
        INNER JOIN [' + @BaseName + N'].dbo.F_ARTICLE fa ON fa.AR_Ref = dl.AR_Ref
        INNER JOIN [' + @BaseName + N'].dbo.F_CATALOGUE cl3 ON cl3.CL_No = fa.CL_No3
        WHERE dl.DL_MvtStock IN (1, 3) AND fa.CL_No3 IS NOT NULL;';
        EXEC sp_executesql @sql;

        SET @sql = N'INSERT INTO Test.stock.CacheFiltres (BaseName, TypeFiltre, Code, Libelle, CL_No1_Parent)
        SELECT DISTINCT ''' + @BaseName + N''', ''cat4'', CAST(fa.CL_No4 AS NVARCHAR(255)), cl4.CL_Intitule, fa.CL_No1
        FROM [' + @BaseName + N'].dbo.F_DOCLIGNE dl
        INNER JOIN [' + @BaseName + N'].dbo.F_ARTICLE fa ON fa.AR_Ref = dl.AR_Ref
        INNER JOIN [' + @BaseName + N'].dbo.F_CATALOGUE cl4 ON cl4.CL_No = fa.CL_No4
        WHERE dl.DL_MvtStock IN (1, 3) AND fa.CL_No4 IS NOT NULL;';
        EXEC sp_executesql @sql;

        FETCH NEXT FROM cur INTO @BaseName;
    END
    CLOSE cur; DEALLOCATE cur;
END
GO

-- ── 10. SP_RefreshStockCache ──────────────────────────────────
CREATE OR ALTER PROCEDURE stock.SP_RefreshStockCache
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @t0       DATETIME = GETDATE();
    DECLARE @nbLignes INT;
    DECLARE @BaseName NVARCHAR(128);
    DECLARE @sql      NVARCHAR(MAX);

    TRUNCATE TABLE stock.StockJournalierCache;

    DECLARE cur CURSOR FOR
        SELECT BaseName FROM stock.SAGE_Bases WHERE IsActive = 1;
    OPEN cur;
    FETCH NEXT FROM cur INTO @BaseName;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @sql = N'
        INSERT INTO Test.stock.StockJournalierCache
        (BaseName, DateJour, AR_Ref, AR_Design,
         FA_CodeFamille, FA_Intitule,
         CL_No1, CL_Intitule1, CL_No2, CL_Intitule2,
         CL_No3, CL_Intitule3, CL_No4, CL_Intitule4,
         DE_No, DE_Intitule,
         TotalEntree, TotalSortie,
         ValeurEntree, ValeurSortie,
         StockInitial, StockFinal,
         ValeurInitiale, ValeurFinale)
        SELECT ''' + @BaseName + N''',
            DateJour, AR_Ref, AR_Design,
            FA_CodeFamille, FA_Intitule,
            CL_No1, CL_Intitule1, CL_No2, CL_Intitule2,
            CL_No3, CL_Intitule3, CL_No4, CL_Intitule4,
            DE_No, DE_Intitule,
            TotalEntree, TotalSortie,
            ValeurEntree, ValeurSortie,
            StockInitial, StockFinal,
            ValeurInitiale, ValeurFinale
        FROM [' + @BaseName + N'].dbo.VW_StockJoursAvecMvt;';
        EXEC sp_executesql @sql;
        FETCH NEXT FROM cur INTO @BaseName;
    END
    CLOSE cur; DEALLOCATE cur;

    SELECT @nbLignes = COUNT(*) FROM stock.StockJournalierCache;
END
GO

-- ── 11. SP_GetBases ──────────────────────────────────────────
CREATE OR ALTER PROCEDURE stock.SP_GetBases
AS
BEGIN
    SET NOCOUNT ON;

    CREATE TABLE #BasesValides (
        BaseName  NVARCHAR(128),
        BaseLabel NVARCHAR(255),
        IsActive  BIT
    );

    DECLARE @BaseName    NVARCHAR(128);
    DECLARE @BaseLabel   NVARCHAR(255);
    DECLARE @checkSql    NVARCHAR(MAX);
    DECLARE @hasDossier  INT;

    DECLARE cur CURSOR FOR
        SELECT BaseName, BaseLabel FROM stock.SAGE_Bases WHERE IsActive = 1;
    OPEN cur;
    FETCH NEXT FROM cur INTO @BaseName, @BaseLabel;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @hasDossier = 0;
        SET @checkSql = N'SELECT @res = COUNT(*) FROM [' + @BaseName
                      + N'].sys.tables WHERE name = ''P_DOSSIER''';
        EXEC sp_executesql @checkSql, N'@res INT OUTPUT', @res = @hasDossier OUTPUT;
        IF @hasDossier > 0
            INSERT INTO #BasesValides VALUES (@BaseName, @BaseLabel, 1);
        FETCH NEXT FROM cur INTO @BaseName, @BaseLabel;
    END
    CLOSE cur; DEALLOCATE cur;

    SELECT BaseName, BaseLabel, IsActive FROM #BasesValides ORDER BY BaseLabel;
    DROP TABLE #BasesValides;
END
GO

-- ── 12. SP_GetFiltres ─────────────────────────────────────────
CREATE OR ALTER PROCEDURE stock.SP_GetFiltres
    @Base           NVARCHAR(128),
    @CL_No1         INT          = NULL,
    @FA_CodeFamille NVARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT 'article' AS Type, Code, Libelle
    FROM stock.CacheFiltres
    WHERE BaseName = @Base AND TypeFiltre = 'article'
      AND (@CL_No1         IS NULL OR CL_No1_Parent  = @CL_No1)
      AND (@FA_CodeFamille IS NULL OR FA_Code_Parent = @FA_CodeFamille)
    ORDER BY Libelle;

    SELECT DISTINCT 'depot' AS Type, Code, Libelle
    FROM stock.CacheFiltres
    WHERE BaseName = @Base AND TypeFiltre = 'depot'
    ORDER BY Libelle;

    SELECT DISTINCT 'famille' AS Type, Code, Libelle
    FROM stock.CacheFiltres
    WHERE BaseName = @Base AND TypeFiltre = 'famille'
    ORDER BY Libelle;

    SELECT DISTINCT 'cat1' AS Type, Code, Libelle
    FROM stock.CacheFiltres
    WHERE BaseName = @Base AND TypeFiltre = 'cat1'
    ORDER BY Libelle;

    SELECT DISTINCT 'cat2' AS Type, Code, Libelle
    FROM stock.CacheFiltres
    WHERE BaseName = @Base AND TypeFiltre = 'cat2'
      AND (@CL_No1 IS NULL OR CL_No1_Parent = @CL_No1)
    ORDER BY Libelle;

    SELECT DISTINCT 'cat3' AS Type, Code, Libelle
    FROM stock.CacheFiltres
    WHERE BaseName = @Base AND TypeFiltre = 'cat3'
      AND (@CL_No1 IS NULL OR CL_No1_Parent = @CL_No1)
    ORDER BY Libelle;

    SELECT DISTINCT 'cat4' AS Type, Code, Libelle
    FROM stock.CacheFiltres
    WHERE BaseName = @Base AND TypeFiltre = 'cat4'
      AND (@CL_No1 IS NULL OR CL_No1_Parent = @CL_No1)
    ORDER BY Libelle;
END
GO

-- ── 13. SP_GetMouvements ──────────────────────────────────────
CREATE OR ALTER PROCEDURE stock.SP_GetMouvements
    @Base           NVARCHAR(128),
    @DateDebut      DATE          = NULL,
    @DateFin        DATE          = NULL,
    @Depot          INT           = NULL,
    @Article        NVARCHAR(50)  = NULL,
    @FA_CodeFamille NVARCHAR(10)  = NULL,
    @CL_No1         INT           = NULL,
    @CL_No2         INT           = NULL,
    @CL_No3         INT           = NULL,
    @CL_No4         INT           = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        DateJour                                         AS [Date],
        AR_Ref                                           AS [Article],
        AR_Design                                        AS [Designation],
        FA_CodeFamille                                   AS [Code Famille],
        FA_Intitule                                      AS [Intitule Famille],
        CL_No1 AS [Cat N1 No], CL_Intitule1 AS [Cat N1],
        CL_No2 AS [Cat N2 No], CL_Intitule2 AS [Cat N2],
        CL_No3 AS [Cat N3 No], CL_Intitule3 AS [Cat N3],
        CL_No4 AS [Cat N4 No], CL_Intitule4 AS [Cat N4],
        DE_No  AS [Depot], DE_Intitule AS [Nom Depot],
        TotalEntree                                      AS [Total Entrees],
        TotalSortie                                      AS [Total Sorties],
        ISNULL(ValeurEntree, 0)                          AS [Valeur Entree],
        ISNULL(ValeurSortie, 0)                          AS [Valeur Sortie],
        ISNULL(ValeurEntree,0) - ISNULL(ValeurSortie,0) AS [Total Valeur Mouvement],
        ISNULL(ValeurFinale, 0)                          AS [Valeur Finale Permanente],
        ISNULL(StockFinal, 0)                            AS [Stock Final]
    FROM stock.StockJournalierCache
    WHERE BaseName = @Base
      AND (@DateDebut       IS NULL OR DateJour       >= @DateDebut)
      AND (@DateFin         IS NULL OR DateJour       <= @DateFin)
      AND (@Depot           IS NULL OR DE_No          =  @Depot)
      AND (@Article         IS NULL OR AR_Ref         =  @Article)
      AND (@FA_CodeFamille  IS NULL OR FA_CodeFamille =  @FA_CodeFamille)
      AND (@CL_No1          IS NULL OR CL_No1         =  @CL_No1)
      AND (@CL_No2          IS NULL OR CL_No2         =  @CL_No2)
      AND (@CL_No3          IS NULL OR CL_No3         =  @CL_No3)
      AND (@CL_No4          IS NULL OR CL_No4         =  @CL_No4)
    ORDER BY DateJour, AR_Ref, DE_No;
END
GO

-- ── 14. SP_GetStockJournalier ─────────────────────────────────
CREATE OR ALTER PROCEDURE stock.SP_GetStockJournalier
    @Base           NVARCHAR(128),
    @DateDebut      DATE,
    @DateFin        DATE,
    @Depot          INT           = NULL,
    @Article        NVARCHAR(50)  = NULL,
    @FA_CodeFamille NVARCHAR(10)  = NULL,
    @CL_No1         INT           = NULL,
    @CL_No2         INT           = NULL,
    @CL_No3         INT           = NULL,
    @CL_No4         INT           = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DateJour, AR_Ref, AR_Design, FA_CodeFamille, FA_Intitule,
           CL_No1, CL_Intitule1, CL_No2, CL_Intitule2,
           CL_No3, CL_Intitule3, CL_No4, CL_Intitule4,
           DE_No, DE_Intitule,
           TotalEntree, TotalSortie, ValeurEntree, ValeurSortie,
           StockInitial, StockFinal, ValeurInitiale, ValeurFinale
    INTO #Base
    FROM stock.StockJournalierCache
    WHERE BaseName = @Base
      AND DateJour <= @DateFin
      AND (@Depot          IS NULL OR DE_No          = @Depot)
      AND (@Article        IS NULL OR AR_Ref         = @Article)
      AND (@FA_CodeFamille IS NULL OR FA_CodeFamille = @FA_CodeFamille)
      AND (@CL_No1         IS NULL OR CL_No1         = @CL_No1)
      AND (@CL_No2         IS NULL OR CL_No2         = @CL_No2)
      AND (@CL_No3         IS NULL OR CL_No3         = @CL_No3)
      AND (@CL_No4         IS NULL OR CL_No4         = @CL_No4);

    CREATE INDEX IX_tmp_Base ON #Base (AR_Ref, DE_No, DateJour DESC);

    WITH Calendrier AS
    (
        SELECT @DateDebut AS DateJour
        UNION ALL
        SELECT DATEADD(DAY, 1, DateJour)
        FROM Calendrier
        WHERE DateJour < @DateFin
    ),
    ArticlesDepots AS
    (
        SELECT DISTINCT
            AR_Ref, AR_Design, FA_CodeFamille, FA_Intitule,
            CL_No1, CL_Intitule1, CL_No2, CL_Intitule2,
            CL_No3, CL_Intitule3, CL_No4, CL_Intitule4,
            DE_No, DE_Intitule
        FROM #Base
    ),
    JoursSansMvt AS
    (
        SELECT
            c.DateJour,
            a.AR_Ref, a.AR_Design, a.FA_CodeFamille, a.FA_Intitule,
            a.CL_No1, a.CL_Intitule1, a.CL_No2, a.CL_Intitule2,
            a.CL_No3, a.CL_Intitule3, a.CL_No4, a.CL_Intitule4,
            a.DE_No, a.DE_Intitule,
            0 AS TotalEntree, 0 AS TotalSortie,
            CAST(0 AS DECIMAL(18,4)) AS ValeurEntree,
            CAST(0 AS DECIMAL(18,4)) AS ValeurSortie,
            ISNULL(ds.StockFinal,   0) AS StockInitial,
            ISNULL(ds.StockFinal,   0) AS StockFinal,
            ISNULL(ds.ValeurFinale, 0) AS ValeurInitiale,
            ISNULL(ds.ValeurFinale, 0) AS ValeurFinale
        FROM Calendrier c
        CROSS JOIN ArticlesDepots a
        OUTER APPLY (
            SELECT TOP 1 StockFinal, ValeurFinale
            FROM #Base b
            WHERE b.AR_Ref  = a.AR_Ref AND b.DE_No = a.DE_No
              AND b.DateJour < c.DateJour
            ORDER BY b.DateJour DESC
        ) ds
        WHERE NOT EXISTS (
            SELECT 1 FROM #Base b
            WHERE b.AR_Ref = a.AR_Ref AND b.DE_No = a.DE_No AND b.DateJour = c.DateJour
        )
        AND c.DateJour BETWEEN @DateDebut AND @DateFin
    )
    SELECT DateJour AS [Date], AR_Ref AS [Article], AR_Design AS [Designation],
           FA_CodeFamille AS [Code Famille], FA_Intitule AS [Intitule Famille],
           CL_No1 AS [Cat N1 No], CL_Intitule1 AS [Cat N1],
           CL_No2 AS [Cat N2 No], CL_Intitule2 AS [Cat N2],
           CL_No3 AS [Cat N3 No], CL_Intitule3 AS [Cat N3],
           CL_No4 AS [Cat N4 No], CL_Intitule4 AS [Cat N4],
           DE_No AS [Depot], DE_Intitule AS [Nom Depot],
           TotalEntree AS [Total Entrees], TotalSortie AS [Total Sorties],
           ValeurEntree AS [Valeur Entree], ValeurSortie AS [Valeur Sortie],
           StockInitial AS [Stock Initial], StockFinal AS [Stock Final],
           ValeurInitiale AS [Valeur Initiale], ValeurFinale AS [Valeur Finale (Permanente)]
    FROM #Base WHERE DateJour BETWEEN @DateDebut AND @DateFin

    UNION ALL

    SELECT DateJour, AR_Ref, AR_Design, FA_CodeFamille, FA_Intitule,
           CL_No1, CL_Intitule1, CL_No2, CL_Intitule2,
           CL_No3, CL_Intitule3, CL_No4, CL_Intitule4,
           DE_No, DE_Intitule,
           TotalEntree, TotalSortie, ValeurEntree, ValeurSortie,
           StockInitial, StockFinal, ValeurInitiale, ValeurFinale
    FROM JoursSansMvt

    ORDER BY [Article], [Depot], [Date]
    OPTION (MAXRECURSION 3660);

    DROP TABLE IF EXISTS #Base;
END
GO

-- ── 15. SP_AddBase ────────────────────────────────────────────
CREATE OR ALTER PROCEDURE stock.SP_AddBase
    @BaseName   NVARCHAR(128),
    @BaseLabel  NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = @BaseName)
    BEGIN
        RAISERROR('Base %s introuvable sur le serveur SQL.', 16, 1, @BaseName);
        RETURN;
    END

    DECLARE @checkSql   NVARCHAR(MAX);
    DECLARE @hasDossier INT = 0;
    SET @checkSql = N'SELECT @res = COUNT(*) FROM [' + @BaseName
                  + N'].sys.tables WHERE name = ''P_DOSSIER''';
    EXEC sp_executesql @checkSql, N'@res INT OUTPUT', @res = @hasDossier OUTPUT;

    IF @hasDossier = 0
    BEGIN
        RAISERROR('La base %s ne contient pas la table P_DOSSIER. Ajout refusé.', 16, 1, @BaseName);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM stock.SAGE_Bases WHERE BaseName = @BaseName)
        INSERT INTO stock.SAGE_Bases (BaseName, BaseLabel, IsActive)
        VALUES (@BaseName, @BaseLabel, 1);
    ELSE
        UPDATE stock.SAGE_Bases SET IsActive = 1, BaseLabel = @BaseLabel WHERE BaseName = @BaseName;

    -- Vue VW_StockJoursAvecMvt dans la base SAGE
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'USE [' + @BaseName + N']; EXEC(''
    CREATE OR ALTER VIEW dbo.VW_StockJoursAvecMvt AS
    WITH
    StockInitialGlobal AS (
        SELECT dl.AR_Ref, dl.DE_No,
            SUM(CASE WHEN dl.DL_MvtStock=1 THEN ABS(dl.DL_Qte) WHEN dl.DL_MvtStock=3 THEN -ABS(dl.DL_Qte) ELSE 0 END) AS QteInitiale,
            SUM(CASE WHEN dl.DL_MvtStock=1 THEN ABS(dl.DL_Qte)*dl.DL_PrixRU WHEN dl.DL_MvtStock=3 THEN -ABS(dl.DL_Qte)*dl.DL_PrixRU ELSE 0 END) AS ValeurInitiale
        FROM dbo.F_DOCLIGNE dl
        WHERE dl.DL_MvtStock IN (1,3)
          AND CAST(dl.DO_Date AS DATE) < (SELECT MIN(CAST(DO_Date AS DATE)) FROM dbo.F_DOCLIGNE WHERE DL_MvtStock IN (1,3))
        GROUP BY dl.AR_Ref, dl.DE_No
    ),
    TousMouvements AS (
        SELECT dl.AR_Ref, fa.AR_Design, fa.FA_CodeFamille, fam.FA_Intitule,
            fa.CL_No1, cl1.CL_Intitule AS CL_Intitule1, fa.CL_No2, cl2.CL_Intitule AS CL_Intitule2,
            fa.CL_No3, cl3.CL_Intitule AS CL_Intitule3, fa.CL_No4, cl4.CL_Intitule AS CL_Intitule4,
            dl.DL_No, CAST(dl.DO_Date AS DATE) AS DateJour, dl.DE_No, dp.DE_Intitule, dl.DL_MvtStock,
            CASE WHEN dl.DL_MvtStock=1 THEN ABS(dl.DL_Qte) WHEN dl.DL_MvtStock=3 THEN -ABS(dl.DL_Qte) END AS QteSignee,
            CASE WHEN dl.DL_MvtStock=1 THEN ABS(dl.DL_Qte) ELSE 0 END AS QteEntree,
            CASE WHEN dl.DL_MvtStock=3 THEN ABS(dl.DL_Qte) ELSE 0 END AS QteSortie,
            CASE WHEN dl.DL_MvtStock=1 THEN dl.DL_PrixRU WHEN dl.DL_MvtStock=3 THEN dl.DL_PrixRU END AS PRU_Ligne,
            CASE WHEN dl.DL_MvtStock=1 THEN dl.DL_PrixRU ELSE 0 END AS PRU_Entree,
            CASE WHEN dl.DL_MvtStock=3 THEN dl.DL_PrixRU ELSE 0 END AS PRU_Sortie
        FROM dbo.F_DOCLIGNE dl
        INNER JOIN dbo.F_ARTICLE fa ON fa.AR_Ref=dl.AR_Ref
        INNER JOIN dbo.F_DEPOT dp ON dp.DE_No=dl.DE_No
        LEFT JOIN dbo.F_FAMILLE fam ON fam.FA_CodeFamille=fa.FA_CodeFamille
        LEFT JOIN dbo.F_CATALOGUE cl1 ON cl1.CL_No=fa.CL_No1
        LEFT JOIN dbo.F_CATALOGUE cl2 ON cl2.CL_No=fa.CL_No2
        LEFT JOIN dbo.F_CATALOGUE cl3 ON cl3.CL_No=fa.CL_No3
        LEFT JOIN dbo.F_CATALOGUE cl4 ON cl4.CL_No=fa.CL_No4
        WHERE dl.DL_MvtStock IN (1,3)
    ),
    CumulsGlissants AS (
        SELECT m.*,
            ISNULL(si.QteInitiale,0)+SUM(m.QteSignee) OVER (PARTITION BY m.AR_Ref,m.DE_No ORDER BY m.DateJour,m.DL_No ROWS UNBOUNDED PRECEDING) AS StockApres,
            ISNULL(si.QteInitiale,0)+ISNULL(SUM(m.QteSignee) OVER (PARTITION BY m.AR_Ref,m.DE_No ORDER BY m.DateJour,m.DL_No ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),0) AS StockAvant,
            ISNULL(si.ValeurInitiale,0)+SUM(m.QteSignee*m.PRU_Ligne) OVER (PARTITION BY m.AR_Ref,m.DE_No ORDER BY m.DateJour,m.DL_No ROWS UNBOUNDED PRECEDING) AS ValeurApres,
            ISNULL(si.ValeurInitiale,0)+ISNULL(SUM(m.QteSignee*m.PRU_Ligne) OVER (PARTITION BY m.AR_Ref,m.DE_No ORDER BY m.DateJour,m.DL_No ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),0) AS ValeurAvant,
            ROW_NUMBER() OVER (PARTITION BY m.AR_Ref,m.DE_No,m.DateJour ORDER BY m.DL_No ASC) AS PremierMvt,
            ROW_NUMBER() OVER (PARTITION BY m.AR_Ref,m.DE_No,m.DateJour ORDER BY m.DL_No DESC) AS DernierMvt
        FROM TousMouvements m
        LEFT JOIN StockInitialGlobal si ON si.AR_Ref=m.AR_Ref AND si.DE_No=m.DE_No
    )
    SELECT DateJour, AR_Ref, AR_Design, FA_CodeFamille, FA_Intitule,
        CL_No1, CL_Intitule1, CL_No2, CL_Intitule2, CL_No3, CL_Intitule3, CL_No4, CL_Intitule4,
        DE_No, DE_Intitule,
        SUM(QteEntree) AS TotalEntree, SUM(QteSortie) AS TotalSortie,
        SUM(QteEntree*PRU_Entree) AS ValeurEntree, SUM(QteSortie*PRU_Sortie) AS ValeurSortie,
        MAX(CASE WHEN PremierMvt=1 THEN StockAvant END) AS StockInitial,
        MAX(CASE WHEN DernierMvt=1 THEN StockApres END) AS StockFinal,
        MAX(CASE WHEN PremierMvt=1 THEN ValeurAvant END) AS ValeurInitiale,
        MAX(CASE WHEN DernierMvt=1 THEN ValeurApres END) AS ValeurFinale
    FROM CumulsGlissants
    GROUP BY DateJour, AR_Ref, AR_Design, FA_CodeFamille, FA_Intitule,
        CL_No1, CL_Intitule1, CL_No2, CL_Intitule2, CL_No3, CL_Intitule3, CL_No4, CL_Intitule4,
        DE_No, DE_Intitule;
    '')';
    EXEC sp_executesql @sql;

    -- Index dans la base SAGE
    SET @sql = N'USE [' + @BaseName + N'];
    IF EXISTS (SELECT 1 FROM sys.indexes WHERE name=''IX_DOCLIGNE_PERF'' AND object_id=OBJECT_ID(''dbo.F_DOCLIGNE''))
        DROP INDEX IX_DOCLIGNE_PERF ON dbo.F_DOCLIGNE;
    CREATE INDEX IX_DOCLIGNE_PERF ON dbo.F_DOCLIGNE (DL_MvtStock, DO_Date, AR_Ref, DE_No)
        INCLUDE (DL_Qte, DL_PrixRU, DL_No) WITH (FILLFACTOR=85, ONLINE=OFF);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name=''IX_ARTICLE_COVER'' AND object_id=OBJECT_ID(''dbo.F_ARTICLE''))
        CREATE INDEX IX_ARTICLE_COVER ON dbo.F_ARTICLE (AR_Ref)
        INCLUDE (AR_Design, FA_CodeFamille, CL_No1, CL_No2, CL_No3, CL_No4) WITH (FILLFACTOR=90);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name=''IX_DEPOT_COVER'' AND object_id=OBJECT_ID(''dbo.F_DEPOT''))
        CREATE INDEX IX_DEPOT_COVER ON dbo.F_DEPOT (DE_No) INCLUDE (DE_Intitule) WITH (FILLFACTOR=90);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name=''IX_CATALOGUE_COVER'' AND object_id=OBJECT_ID(''dbo.F_CATALOGUE''))
        CREATE INDEX IX_CATALOGUE_COVER ON dbo.F_CATALOGUE (CL_No) INCLUDE (CL_Intitule) WITH (FILLFACTOR=90);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name=''IX_FAMILLE_COVER'' AND object_id=OBJECT_ID(''dbo.F_FAMILLE''))
        CREATE INDEX IX_FAMILLE_COVER ON dbo.F_FAMILLE (FA_CodeFamille) INCLUDE (FA_Intitule) WITH (FILLFACTOR=90);';
    EXEC sp_executesql @sql;

    EXEC stock.SP_RebuildUnifiedViews;
    EXEC stock.SP_RefreshCacheFiltres;
    EXEC stock.SP_RefreshStockCache;

    SELECT 'OK' AS Statut, @BaseName AS Base, 'Base ajoutée avec succès' AS Message;
END
GO

-- ── 16. SP_RemoveBase ─────────────────────────────────────────
CREATE OR ALTER PROCEDURE stock.SP_RemoveBase
    @BaseName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE stock.SAGE_Bases SET IsActive = 0 WHERE BaseName = @BaseName;
    SELECT 'OK' AS Statut, @BaseName AS Base, 'Base désactivée avec succès' AS Message;
END
GO

-- ── 17. SP_RefreshSiNecessaire ────────────────────────────────
CREATE OR ALTER PROCEDURE stock.SP_RefreshSiNecessaire
    @HeuresMax INT = 8
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @dernier DATETIME;
    SELECT @dernier = MAX(DateRefresh) FROM stock.StockJournalierCache;

    IF @dernier IS NULL OR DATEDIFF(HOUR, @dernier, GETDATE()) >= @HeuresMax
    BEGIN
        EXEC stock.SP_RefreshCacheFiltres;
        EXEC stock.SP_RefreshStockCache;
        SELECT 'REFRESHED' AS Statut, GETDATE() AS DateRefresh, @dernier AS AncienneDate;
    END
    ELSE
    BEGIN
        SELECT 'OK' AS Statut, @dernier AS DateRefresh,
               DATEDIFF(MINUTE, @dernier, GETDATE()) AS AgeMinutes;
    END
END
GO

-- ── 18. SP_VW_Dimensions ──────────────────────────────────────
CREATE OR ALTER VIEW stock.VW_Dimensions
AS
SELECT
    CAST(NULL AS NVARCHAR(128)) AS BaseName,
    CAST(NULL AS NVARCHAR(50))  AS AR_Ref,
    CAST(NULL AS NVARCHAR(255)) AS AR_Design,
    CAST(NULL AS INT)           AS DE_No,
    CAST(NULL AS NVARCHAR(255)) AS DE_Intitule,
    CAST(NULL AS INT)           AS CL_No1,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule1,
    CAST(NULL AS INT)           AS CL_No2,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule2,
    CAST(NULL AS INT)           AS CL_No3,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule3,
    CAST(NULL AS INT)           AS CL_No4,
    CAST(NULL AS NVARCHAR(255)) AS CL_Intitule4,
    CAST(NULL AS NVARCHAR(10))  AS FA_CodeFamille,
    CAST(NULL AS NVARCHAR(255)) AS FA_Intitule
WHERE 1 = 0;
GO

PRINT '✅ Initialisation complète — Base Test prête.';
GO