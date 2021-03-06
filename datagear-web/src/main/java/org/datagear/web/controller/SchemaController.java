/*
 * Copyright 2018 datagear.tech. All Rights Reserved.
 */

package org.datagear.web.controller;

import java.sql.Connection;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.datagear.connection.ConnectionSource;
import org.datagear.dbinfo.DatabaseInfoResolver;
import org.datagear.dbinfo.TableInfo;
import org.datagear.dbmodel.CachedDbModelFactory;
import org.datagear.management.domain.Schema;
import org.datagear.management.domain.User;
import org.datagear.management.service.SchemaService;
import org.datagear.model.Model;
import org.datagear.persistence.Order;
import org.datagear.persistence.PagingData;
import org.datagear.persistence.PagingQuery;
import org.datagear.persistence.Query;
import org.datagear.util.IDUtil;
import org.datagear.util.JdbcUtil;
import org.datagear.web.OperationMessage;
import org.datagear.web.convert.ClassDataConverter;
import org.datagear.web.util.KeywordMatcher;
import org.datagear.web.util.WebUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * 模式管理控制器。
 * 
 * @author datagear@163.com
 *
 */
@Controller
@RequestMapping("/schema")
public class SchemaController extends AbstractSchemaModelConnController
{
	public static final String COOKIE_PAGINATION_SIZE = "SCHEMA_PAGINATION_PAGE_SIZE";

	@Autowired
	private DatabaseInfoResolver databaseInfoResolver;

	public SchemaController()
	{
		super();
	}

	public SchemaController(MessageSource messageSource, ClassDataConverter classDataConverter,
			SchemaService schemaService, ConnectionSource connectionSource, CachedDbModelFactory cachedDbModelFactory,
			DatabaseInfoResolver databaseInfoResolver)
	{
		super(messageSource, classDataConverter, schemaService, connectionSource, cachedDbModelFactory);

		this.databaseInfoResolver = databaseInfoResolver;
	}

	public DatabaseInfoResolver getDatabaseInfoResolver()
	{
		return databaseInfoResolver;
	}

	public void setDatabaseInfoResolver(DatabaseInfoResolver databaseInfoResolver)
	{
		this.databaseInfoResolver = databaseInfoResolver;
	}

	@RequestMapping("/add")
	public String add(org.springframework.ui.Model model,
			@RequestParam(value = "copyId", required = false) String copyId)
	{
		Schema schema = new Schema();

		Schema sourceSchema = null;

		if (!isEmpty(copyId))
		{
			sourceSchema = getSchemaService().getById(copyId);

			if (sourceSchema != null)
			{
				schema.setTitle(sourceSchema.getTitle());
				schema.setUrl(sourceSchema.getUrl());
				schema.setUser(sourceSchema.getUser());
				schema.setDriverEntity(sourceSchema.getDriverEntity());
			}
		}

		model.addAttribute("schema", schema);
		model.addAttribute(KEY_TITLE_MESSAGE_KEY, "schema.addSchema");
		model.addAttribute(KEY_FORM_ACTION, "saveadd");

		return "/schema/schema_form";
	}

	@RequestMapping(value = "/saveadd", produces = CONTENT_TYPE_JSON)
	@ResponseBody
	public ResponseEntity<OperationMessage> saveAdd(HttpServletRequest request, HttpServletResponse response,
			Schema schema)
	{
		User user = WebUtils.getUser(request, response);

		if (isBlank(schema.getTitle()) || isBlank(schema.getUrl()))
			throw new IllegalInputException();

		schema.setId(IDUtil.randomIdOnTime20());
		schema.setCreateTime(new Date());
		schema.setCreateUser(WebUtils.getUser(request, response));

		getSchemaService().add(user, schema);

		return buildOperationMessageSaveSuccessResponseEntity(request);
	}

	@RequestMapping("/edit")
	public String edit(HttpServletRequest request, HttpServletResponse response, org.springframework.ui.Model model,
			@RequestParam("id") String id)
	{
		User user = WebUtils.getUser(request, response);

		Schema schema = getSchemaService().getByIdForEdit(user, id);

		if (schema == null)
			throw new RecordNotFoundException();

		model.addAttribute("schema", schema);
		model.addAttribute(KEY_TITLE_MESSAGE_KEY, "schema.editSchema");
		model.addAttribute(KEY_FORM_ACTION, "saveedit");

		return "/schema/schema_form";
	}

	@RequestMapping(value = "/saveedit", produces = CONTENT_TYPE_JSON)
	@ResponseBody
	public ResponseEntity<OperationMessage> saveEdit(HttpServletRequest request, HttpServletResponse response,
			Schema schema)
	{
		if (isBlank(schema.getTitle()) || isBlank(schema.getUrl()))
			throw new IllegalInputException();

		Schema old = getSchemaService().getById(schema.getId());

		boolean updated = getSchemaService().update(WebUtils.getUser(request, response), schema);

		// 如果URL或者用户变更了，则需要清除缓存
		if (updated && old != null
				&& (!schema.getUrl().equals(old.getUrl()) || !schema.getUser().equals(old.getUser())))
			getCachedDbModelFactory().removeCachedModel(schema.getId());

		return buildOperationMessageSaveSuccessResponseEntity(request);
	}

	@RequestMapping("/view")
	public String view(HttpServletRequest request, HttpServletResponse response, org.springframework.ui.Model model,
			@RequestParam("id") String id)
	{
		User user = WebUtils.getUser(request, response);

		Schema schema = getSchemaService().getById(user, id);

		if (schema == null)
			throw new RecordNotFoundException();

		schema.clearPassword();

		model.addAttribute("schema", schema);
		model.addAttribute(KEY_TITLE_MESSAGE_KEY, "schema.viewSchema");
		model.addAttribute(KEY_READONLY, true);

		return "/schema/schema_form";
	}

	@RequestMapping(value = "/delete", produces = CONTENT_TYPE_JSON)
	@ResponseBody
	public ResponseEntity<OperationMessage> delete(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("id") String[] ids)
	{
		User user = WebUtils.getUser(request, response);

		for (int i = 0; i < ids.length; i++)
		{
			String id = ids[i];

			boolean deleted = getSchemaService().deleteById(user, id);

			// 清除缓存
			if (deleted)
				getCachedDbModelFactory().removeCachedModel(id);
		}

		return buildOperationMessageDeleteSuccessResponseEntity(request);
	}

	@RequestMapping(value = "/query")
	public String query(HttpServletRequest request, HttpServletResponse response, org.springframework.ui.Model model)
	{
		model.addAttribute(KEY_TITLE_MESSAGE_KEY, "schema.manageSchema");

		return "/schema/schema_grid";
	}

	@RequestMapping(value = "/select")
	public String select(HttpServletRequest request, HttpServletResponse response, org.springframework.ui.Model model)
	{
		model.addAttribute(KEY_TITLE_MESSAGE_KEY, "schema.selectSchema");
		model.addAttribute(KEY_SELECTONLY, true);

		return "/schema/schema_grid";
	}

	@RequestMapping(value = "/queryData", produces = CONTENT_TYPE_JSON)
	@ResponseBody
	public List<Schema> queryData(HttpServletRequest request, HttpServletResponse response) throws Exception
	{
		User user = WebUtils.getUser(request, response);

		PagingQuery pagingQuery = getPagingQuery(request, null);

		List<Schema> schemas = getSchemaService().query(user, pagingQuery);
		processForUI(request, schemas);

		return schemas;
	}

	@RequestMapping(value = "/testConnection", produces = CONTENT_TYPE_JSON)
	@ResponseBody
	public ResponseEntity<OperationMessage> testConnection(HttpServletRequest request, HttpServletResponse response,
			Schema schema) throws Exception
	{
		if (isBlank(schema.getTitle()) || isBlank(schema.getUrl()))
			throw new IllegalInputException();
		
		Connection cn = null;
		
		try
		{
			cn = getSchemaConnection(schema);
		}
		finally
		{
			JdbcUtil.closeConnection(cn);
		}

		return buildOperationMessageSuccessResponseEntity(request, "schema.testConnection.ok");
	}

	@RequestMapping(value = "/list", produces = CONTENT_TYPE_JSON)
	@ResponseBody
	public List<Schema> list(HttpServletRequest request, HttpServletResponse response,
			@RequestParam(value = "keyword", required = false) String keyword)
	{
		User user = WebUtils.getUser(request, response);

		Query query = new Query();
		query.setKeyword(keyword);
		query.setOrders(Order.valueOf("title", Order.ASC));

		List<Schema> schemas = getSchemaService().query(user, query);
		processForUI(request, schemas);

		return schemas;
	}

	@RequestMapping(value = "/{schemaId}/pagingQueryTable", produces = CONTENT_TYPE_JSON)
	@ResponseBody
	public PagingData<TableInfo> pagingQueryTable(HttpServletRequest request, HttpServletResponse response,
			org.springframework.ui.Model springModel, @PathVariable("schemaId") String schemaId) throws Throwable
	{
		PagingQuery pagingQuery = getPagingQuery(request, COOKIE_PAGINATION_SIZE);

		TableInfo[] tableInfos = new ReturnSchemaConnExecutor<TableInfo[]>(request, response, springModel, schemaId,
				true)
		{
			@Override
			protected TableInfo[] execute(HttpServletRequest request, HttpServletResponse response,
					org.springframework.ui.Model springModel, Schema schema) throws Throwable
			{
				return getDatabaseInfoResolver().getTableInfos(getConnection());
			}

		}.execute();

		sortByTableName(tableInfos);

		List<TableInfo> keywordTableInfos = findByKeyword(tableInfos, pagingQuery.getKeyword());

		PagingData<TableInfo> pagingData = new PagingData<TableInfo>(pagingQuery.getPage(), keywordTableInfos.size(),
				pagingQuery.getPageSize());

		keywordTableInfos = keywordTableInfos.subList(pagingData.getStartIndex(), pagingData.getEndIndex());

		pagingData.setItems(keywordTableInfos);

		return pagingData;
	}

	@RequestMapping(value = "/{schemaId}/model/{tableName}", produces = CONTENT_TYPE_JSON)
	@ResponseBody
	public Model getModel(HttpServletRequest request, HttpServletResponse response,
			org.springframework.ui.Model springModel, @PathVariable("schemaId") String schemaId,
			@PathVariable("tableName") String tableName,
			@RequestParam(value = "reload", required = false) Boolean forceReload) throws Throwable
	{
		if (Boolean.TRUE.equals(forceReload))
			getCachedDbModelFactory().removeCachedModel(schemaId, tableName);

		ReturnSchemaModelConnExecutor<Model> executor = new ReturnSchemaModelConnExecutor<Model>(request, response,
				springModel, schemaId, tableName, true)
		{
			@Override
			protected Model execute(HttpServletRequest request, HttpServletResponse response,
					org.springframework.ui.Model springModel, Schema schema, Model model) throws Exception
			{
				return model;
			}
		};

		return executor.execute();
	}

	/**
	 * 处理展示。
	 * 
	 * @param request
	 * @param schemas
	 */
	protected void processForUI(HttpServletRequest request, List<Schema> schemas)
	{
		if (schemas != null && !schemas.isEmpty())
		{
			String anonymouseUser = getMessage(request, "anonymousUser");

			for (Schema schema : schemas)
			{
				// 清除密码，避免传输至客户端引起安全问题。
				schema.clearPassword();

				User createUser = schema.getCreateUser();

				if (createUser != null && createUser.isAnonymous())
					createUser.setRealName(anonymouseUser);
			}
		}
	}

	/**
	 * 将{@linkplain TableInfo}数组按照{@linkplain TableInfo#getName()}排序。
	 * 
	 * @param tableInfos
	 */
	public static void sortByTableName(TableInfo[] tableInfos)
	{
		Arrays.<TableInfo> sort(tableInfos, TABLE_INFO_SORT_BY_NAME_COMPARATOR);
	}

	/**
	 * 根据表名称关键字查询{@linkplain TableInfo}列表。
	 * 
	 * @param tableInfos
	 * @param tableNameKeyword
	 * @return
	 */
	public static List<TableInfo> findByKeyword(TableInfo[] tableInfos, String tableNameKeyword)
	{
		return KeywordMatcher.<TableInfo> match(tableInfos, tableNameKeyword, new KeywordMatcher.MatchValue<TableInfo>()
		{
			@Override
			public String[] get(TableInfo t)
			{
				return new String[] { t.getName() };
			}
		});
	}

	public static Comparator<TableInfo> TABLE_INFO_SORT_BY_NAME_COMPARATOR = new Comparator<TableInfo>()
	{
		@Override
		public int compare(TableInfo o1, TableInfo o2)
		{
			return o1.getName().compareTo(o2.getName());
		}
	};
}
