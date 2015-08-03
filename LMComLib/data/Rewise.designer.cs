﻿#pragma warning disable 1591
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.34209
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace RewiseData
{
	using System.Data.Linq;
	using System.Data.Linq.Mapping;
	using System.Data;
	using System.Collections.Generic;
	using System.Reflection;
	using System.Linq;
	using System.Linq.Expressions;
	using System.ComponentModel;
	using System;
	
	
	[global::System.Data.Linq.Mapping.DatabaseAttribute(Name="Rewise")]
	public partial class RewiseDataContext : System.Data.Linq.DataContext
	{
		
		private static System.Data.Linq.Mapping.MappingSource mappingSource = new AttributeMappingSource();
		
    #region Extensibility Method Definitions
    partial void OnCreated();
    partial void InsertRwFactDiff(RwFactDiff instance);
    partial void UpdateRwFactDiff(RwFactDiff instance);
    partial void DeleteRwFactDiff(RwFactDiff instance);
    partial void InsertRwUser(RwUser instance);
    partial void UpdateRwUser(RwUser instance);
    partial void DeleteRwUser(RwUser instance);
    #endregion
		
		public RewiseDataContext() : 
				base(global::LMComLib.Properties.Settings.Default.RewiseConnectionString, mappingSource)
		{
			OnCreated();
		}
		
		public RewiseDataContext(string connection) : 
				base(connection, mappingSource)
		{
			OnCreated();
		}
		
		public RewiseDataContext(System.Data.IDbConnection connection) : 
				base(connection, mappingSource)
		{
			OnCreated();
		}
		
		public RewiseDataContext(string connection, System.Data.Linq.Mapping.MappingSource mappingSource) : 
				base(connection, mappingSource)
		{
			OnCreated();
		}
		
		public RewiseDataContext(System.Data.IDbConnection connection, System.Data.Linq.Mapping.MappingSource mappingSource) : 
				base(connection, mappingSource)
		{
			OnCreated();
		}
		
		public System.Data.Linq.Table<RwFactDiff> RwFactDiffs
		{
			get
			{
				return this.GetTable<RwFactDiff>();
			}
		}
		
		public System.Data.Linq.Table<RwUser> RwUsers
		{
			get
			{
				return this.GetTable<RwUser>();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.RwFactDiff")]
	public partial class RwFactDiff : INotifyPropertyChanging, INotifyPropertyChanged
	{
		
		private static PropertyChangingEventArgs emptyChangingEventArgs = new PropertyChangingEventArgs(String.Empty);
		
		private int _Id;
		
		private int _UserId;
		
		private short _DataFormat;
		
		private System.Data.Linq.Binary _Data;
		
		private int _FactUniqueId;
		
		private EntityRef<RwUser> _RwUser;
		
    #region Extensibility Method Definitions
    partial void OnLoaded();
    partial void OnValidate(System.Data.Linq.ChangeAction action);
    partial void OnCreated();
    partial void OnIdChanging(int value);
    partial void OnIdChanged();
    partial void OnUserIdChanging(int value);
    partial void OnUserIdChanged();
    partial void OnDataFormatChanging(short value);
    partial void OnDataFormatChanged();
    partial void OnDataChanging(System.Data.Linq.Binary value);
    partial void OnDataChanged();
    partial void OnFactUniqueIdChanging(int value);
    partial void OnFactUniqueIdChanged();
    #endregion
		
		public RwFactDiff()
		{
			this._RwUser = default(EntityRef<RwUser>);
			OnCreated();
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Id", AutoSync=AutoSync.OnInsert, DbType="Int NOT NULL IDENTITY", IsPrimaryKey=true, IsDbGenerated=true)]
		public int Id
		{
			get
			{
				return this._Id;
			}
			set
			{
				if ((this._Id != value))
				{
					this.OnIdChanging(value);
					this.SendPropertyChanging();
					this._Id = value;
					this.SendPropertyChanged("Id");
					this.OnIdChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_UserId", DbType="Int NOT NULL")]
		public int UserId
		{
			get
			{
				return this._UserId;
			}
			set
			{
				if ((this._UserId != value))
				{
					if (this._RwUser.HasLoadedOrAssignedValue)
					{
						throw new System.Data.Linq.ForeignKeyReferenceAlreadyHasValueException();
					}
					this.OnUserIdChanging(value);
					this.SendPropertyChanging();
					this._UserId = value;
					this.SendPropertyChanged("UserId");
					this.OnUserIdChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_DataFormat", DbType="SmallInt NOT NULL")]
		public short DataFormat
		{
			get
			{
				return this._DataFormat;
			}
			set
			{
				if ((this._DataFormat != value))
				{
					this.OnDataFormatChanging(value);
					this.SendPropertyChanging();
					this._DataFormat = value;
					this.SendPropertyChanged("DataFormat");
					this.OnDataFormatChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Data", DbType="VarBinary(MAX) NOT NULL", CanBeNull=false, UpdateCheck=UpdateCheck.Never)]
		public System.Data.Linq.Binary Data
		{
			get
			{
				return this._Data;
			}
			set
			{
				if ((this._Data != value))
				{
					this.OnDataChanging(value);
					this.SendPropertyChanging();
					this._Data = value;
					this.SendPropertyChanged("Data");
					this.OnDataChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_FactUniqueId", DbType="Int NOT NULL")]
		public int FactUniqueId
		{
			get
			{
				return this._FactUniqueId;
			}
			set
			{
				if ((this._FactUniqueId != value))
				{
					this.OnFactUniqueIdChanging(value);
					this.SendPropertyChanging();
					this._FactUniqueId = value;
					this.SendPropertyChanged("FactUniqueId");
					this.OnFactUniqueIdChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.AssociationAttribute(Name="RwUser_RwFactDiff", Storage="_RwUser", ThisKey="UserId", OtherKey="Id", IsForeignKey=true)]
		public RwUser RwUser
		{
			get
			{
				return this._RwUser.Entity;
			}
			set
			{
				RwUser previousValue = this._RwUser.Entity;
				if (((previousValue != value) 
							|| (this._RwUser.HasLoadedOrAssignedValue == false)))
				{
					this.SendPropertyChanging();
					if ((previousValue != null))
					{
						this._RwUser.Entity = null;
						previousValue.RwFactDiffs.Remove(this);
					}
					this._RwUser.Entity = value;
					if ((value != null))
					{
						value.RwFactDiffs.Add(this);
						this._UserId = value.Id;
					}
					else
					{
						this._UserId = default(int);
					}
					this.SendPropertyChanged("RwUser");
				}
			}
		}
		
		public event PropertyChangingEventHandler PropertyChanging;
		
		public event PropertyChangedEventHandler PropertyChanged;
		
		protected virtual void SendPropertyChanging()
		{
			if ((this.PropertyChanging != null))
			{
				this.PropertyChanging(this, emptyChangingEventArgs);
			}
		}
		
		protected virtual void SendPropertyChanged(String propertyName)
		{
			if ((this.PropertyChanged != null))
			{
				this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.RwUser")]
	public partial class RwUser : INotifyPropertyChanging, INotifyPropertyChanged
	{
		
		private static PropertyChangingEventArgs emptyChangingEventArgs = new PropertyChangingEventArgs(String.Empty);
		
		private int _Id;
		
		private string _UserId;
		
		private short _Site;
		
		private short _Line;
		
		private short _Lang;
		
		private System.Data.Linq.Binary _DailyInfo;
		
		private System.Data.Linq.Binary _Settings;
		
		private System.Data.Linq.Binary _Facts;
		
		private EntitySet<RwFactDiff> _RwFactDiffs;
		
    #region Extensibility Method Definitions
    partial void OnLoaded();
    partial void OnValidate(System.Data.Linq.ChangeAction action);
    partial void OnCreated();
    partial void OnIdChanging(int value);
    partial void OnIdChanged();
    partial void OnUserIdChanging(string value);
    partial void OnUserIdChanged();
    partial void OnSiteChanging(short value);
    partial void OnSiteChanged();
    partial void OnLineChanging(short value);
    partial void OnLineChanged();
    partial void OnLangChanging(short value);
    partial void OnLangChanged();
    partial void OnDailyInfoChanging(System.Data.Linq.Binary value);
    partial void OnDailyInfoChanged();
    partial void OnSettingsChanging(System.Data.Linq.Binary value);
    partial void OnSettingsChanged();
    partial void OnFactsChanging(System.Data.Linq.Binary value);
    partial void OnFactsChanged();
    #endregion
		
		public RwUser()
		{
			this._RwFactDiffs = new EntitySet<RwFactDiff>(new Action<RwFactDiff>(this.attach_RwFactDiffs), new Action<RwFactDiff>(this.detach_RwFactDiffs));
			OnCreated();
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Id", AutoSync=AutoSync.OnInsert, DbType="Int NOT NULL IDENTITY", IsPrimaryKey=true, IsDbGenerated=true)]
		public int Id
		{
			get
			{
				return this._Id;
			}
			set
			{
				if ((this._Id != value))
				{
					this.OnIdChanging(value);
					this.SendPropertyChanging();
					this._Id = value;
					this.SendPropertyChanged("Id");
					this.OnIdChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_UserId", DbType="Char(32) NOT NULL", CanBeNull=false)]
		public string UserId
		{
			get
			{
				return this._UserId;
			}
			set
			{
				if ((this._UserId != value))
				{
					this.OnUserIdChanging(value);
					this.SendPropertyChanging();
					this._UserId = value;
					this.SendPropertyChanged("UserId");
					this.OnUserIdChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Site", DbType="SmallInt NOT NULL")]
		public short Site
		{
			get
			{
				return this._Site;
			}
			set
			{
				if ((this._Site != value))
				{
					this.OnSiteChanging(value);
					this.SendPropertyChanging();
					this._Site = value;
					this.SendPropertyChanged("Site");
					this.OnSiteChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Line", DbType="SmallInt NOT NULL")]
		public short Line
		{
			get
			{
				return this._Line;
			}
			set
			{
				if ((this._Line != value))
				{
					this.OnLineChanging(value);
					this.SendPropertyChanging();
					this._Line = value;
					this.SendPropertyChanged("Line");
					this.OnLineChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Lang", DbType="SmallInt NOT NULL")]
		public short Lang
		{
			get
			{
				return this._Lang;
			}
			set
			{
				if ((this._Lang != value))
				{
					this.OnLangChanging(value);
					this.SendPropertyChanging();
					this._Lang = value;
					this.SendPropertyChanged("Lang");
					this.OnLangChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_DailyInfo", DbType="VarBinary(MAX) NOT NULL", CanBeNull=false, UpdateCheck=UpdateCheck.Never)]
		public System.Data.Linq.Binary DailyInfo
		{
			get
			{
				return this._DailyInfo;
			}
			set
			{
				if ((this._DailyInfo != value))
				{
					this.OnDailyInfoChanging(value);
					this.SendPropertyChanging();
					this._DailyInfo = value;
					this.SendPropertyChanged("DailyInfo");
					this.OnDailyInfoChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Settings", DbType="VarBinary(MAX) NOT NULL", CanBeNull=false, UpdateCheck=UpdateCheck.Never)]
		public System.Data.Linq.Binary Settings
		{
			get
			{
				return this._Settings;
			}
			set
			{
				if ((this._Settings != value))
				{
					this.OnSettingsChanging(value);
					this.SendPropertyChanging();
					this._Settings = value;
					this.SendPropertyChanged("Settings");
					this.OnSettingsChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Facts", DbType="VarBinary(MAX) NOT NULL", CanBeNull=false, UpdateCheck=UpdateCheck.Never)]
		public System.Data.Linq.Binary Facts
		{
			get
			{
				return this._Facts;
			}
			set
			{
				if ((this._Facts != value))
				{
					this.OnFactsChanging(value);
					this.SendPropertyChanging();
					this._Facts = value;
					this.SendPropertyChanged("Facts");
					this.OnFactsChanged();
				}
			}
		}
		
		[global::System.Data.Linq.Mapping.AssociationAttribute(Name="RwUser_RwFactDiff", Storage="_RwFactDiffs", ThisKey="Id", OtherKey="UserId")]
		public EntitySet<RwFactDiff> RwFactDiffs
		{
			get
			{
				return this._RwFactDiffs;
			}
			set
			{
				this._RwFactDiffs.Assign(value);
			}
		}
		
		public event PropertyChangingEventHandler PropertyChanging;
		
		public event PropertyChangedEventHandler PropertyChanged;
		
		protected virtual void SendPropertyChanging()
		{
			if ((this.PropertyChanging != null))
			{
				this.PropertyChanging(this, emptyChangingEventArgs);
			}
		}
		
		protected virtual void SendPropertyChanged(String propertyName)
		{
			if ((this.PropertyChanged != null))
			{
				this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
			}
		}
		
		private void attach_RwFactDiffs(RwFactDiff entity)
		{
			this.SendPropertyChanging();
			entity.RwUser = this;
		}
		
		private void detach_RwFactDiffs(RwFactDiff entity)
		{
			this.SendPropertyChanging();
			entity.RwUser = null;
		}
	}
}
#pragma warning restore 1591
